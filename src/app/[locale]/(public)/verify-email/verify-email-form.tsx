"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, ClockIcon, Loader2Icon } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthHeading } from "@/components/layout/auth-heading";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useMounted } from "@/hooks/use-mounted";
import { useResendVerificationCodeMutation } from "@/hooks/use-resend-verification-code-mutation";
import { useVerifyEmailMutation } from "@/hooks/use-verify-email-mutation";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  VERIFICATION_CODE_LENGTH,
  verificationCodeSchema,
  type VerificationCodeInput,
} from "@/schemas/auth";
import { useVerificationStore } from "@/stores/verification-store";
import {
  RESEND_CODE_ERROR_CODES,
  VERIFY_EMAIL_ERROR_CODES,
} from "@/types/auth";

/** A code is valid for 10 minutes (POST /auth/verify-email). */
const CODE_VALIDITY_SECONDS = 10 * 60;
/** The API sends at most one code per minute. */
const RESEND_COOLDOWN_SECONDS = 60;
/** Below this, the validity countdown turns to the warning color. */
const EXPIRY_WARNING_SECONDS = 60;

// Field errors are translation keys. Keys starting with "verifyEmail." come
// from the API (auth.verifyEmail namespace); the others are Zod keys.
const SERVER_PREFIX = "verifyEmail.";

type BannerKey =
  | "errorAlreadyVerified"
  | "errorTooManyAttempts"
  | "errorLocked"
  | "errorSessionNotOpened"
  | "errorResendTooSoon"
  | "errorResendLimit"
  | "errorEmailNotSent"
  | "errorInvalid"
  | "errorNetwork"
  | "errorGeneric";

function fallbackKey(error: unknown): BannerKey {
  if (error instanceof ApiError) {
    return error.status === 400 ? "errorInvalid" : "errorGeneric";
  }
  // fetch() rejects with a TypeError when the server can't be reached.
  return error instanceof TypeError ? "errorNetwork" : "errorGeneric";
}

/** Seconds left on the code's validity and on the resend cooldown. */
function useCodeTimers(codeSentAt: number) {
  const [now, setNow] = useState(() => Date.now());
  // Clamped so a code sent after the last tick never shows more than the max.
  const elapsed = Math.max(0, (now - codeSentAt) / 1000);
  const validFor = Math.max(0, Math.ceil(CODE_VALIDITY_SECONDS - elapsed));
  const resendIn = Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed));
  const ticking = validFor > 0;

  useEffect(() => {
    if (!ticking) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ticking, codeSentAt]);

  return { validFor, resendIn };
}

function formatSeconds(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

const linkClass =
  "cursor-pointer rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default disabled:opacity-60 disabled:hover:no-underline";

export function VerifyEmailForm() {
  // The pending email lives in sessionStorage: render on the client only,
  // so the server HTML never disagrees with it.
  const mounted = useMounted();
  if (!mounted) return <div className="min-h-96" aria-hidden />;
  return <PendingVerification />;
}

function PendingVerification() {
  // Mounted after hydration only: during hydration Zustand returns its
  // initial state (no email), not what sessionStorage holds.
  const email = useVerificationStore((state) => state.email);
  // Read once: a successful verification clears the store, and the page
  // must not switch to the empty state while it redirects.
  const [pendingEmail] = useState(email);

  if (!pendingEmail) return <NoPendingVerification />;
  return <VerifyEmailContent email={pendingEmail} />;
}

/** Shown when the page is opened without signing up first. */
function NoPendingVerification() {
  const t = useTranslations("auth.verifyEmail");

  return (
    <>
      <AuthHeading title={t("noPendingTitle")} subtitle={t("noPendingDescription")} />
      <Link
        href="/signup"
        className={cn(
          buttonVariants(),
          "h-11 w-full rounded-lg text-base font-medium hover:bg-primary/90",
        )}
      >
        {t("createAccount")}
      </Link>
      <p className="mt-8 border-t border-border pt-6 text-center text-sm text-pretty text-muted-foreground">
        {t("alreadyActive")}{" "}
        <Link href="/login" className={linkClass}>
          {t("signIn")}
        </Link>
      </p>
    </>
  );
}

function VerifyEmailContent({ email }: { email: string }) {
  const t = useTranslations("auth.verifyEmail");
  const tValidation = useTranslations("validation");
  const router = useRouter();

  const storedCodeSentAt = useVerificationStore((state) => state.codeSentAt);
  const markCodeSent = useVerificationStore((state) => state.markCodeSent);
  const clearVerification = useVerificationStore((state) => state.clear);
  // Keep the last known time while the store is cleared on success.
  const [codeSentAt, setCodeSentAt] = useState(() => storedCodeSentAt ?? Date.now());
  if (storedCodeSentAt !== null && storedCodeSentAt !== codeSentAt) {
    setCodeSentAt(storedCodeSentAt);
  }

  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationCodeMutation();
  const [banner, setBanner] = useState<BannerKey | null>(null);
  const { validFor, resendIn } = useCodeTimers(codeSentAt);
  const expired = validFor === 0;

  const form = useForm<VerificationCodeInput>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: { code: "" },
    mode: "onSubmit",
  });

  // Stay disabled after success while the page redirects.
  const isPending = verifyMutation.isPending || verifyMutation.isSuccess;

  function errorText(message: string) {
    return message.startsWith(SERVER_PREFIX)
      ? t(message.slice(SERVER_PREFIX.length))
      : tValidation(message);
  }

  /** Clears the code and shows the error under it, ready for a new try. */
  function rejectCode(key: string) {
    form.setValue("code", "");
    form.setError("code", { type: "server", message: `${SERVER_PREFIX}${key}` });
    // Inputs are disabled while the request is pending.
    setTimeout(() => form.setFocus("code"), 0);
  }

  function onSubmit({ code }: VerificationCodeInput) {
    if (expired) return;
    setBanner(null);
    verifyMutation.mutate(
      { email, code },
      {
        onSuccess: () => {
          clearVerification();
          toast.success(t("success"));
          router.replace("/");
        },
        onError: (error) => {
          const errorCode = error instanceof ApiError ? error.code : undefined;
          switch (errorCode) {
            case VERIFY_EMAIL_ERROR_CODES.invalid:
              return rejectCode("errorCodeIncorrect");
            case VERIFY_EMAIL_ERROR_CODES.expired:
              return rejectCode("errorCodeExpired");
            case VERIFY_EMAIL_ERROR_CODES.alreadyVerified:
              clearVerification();
              return setBanner("errorAlreadyVerified");
            case VERIFY_EMAIL_ERROR_CODES.tooManyAttempts:
              form.setValue("code", "");
              return setBanner("errorTooManyAttempts");
            case VERIFY_EMAIL_ERROR_CODES.locked:
              return setBanner("errorLocked");
            case VERIFY_EMAIL_ERROR_CODES.sessionNotOpened:
              form.setValue("code", "");
              return setBanner("errorSessionNotOpened");
            default:
              return setBanner(fallbackKey(error));
          }
        },
      },
    );
  }

  function onResend() {
    setBanner(null);
    resendMutation.mutate(email, {
      onSuccess: () => {
        // Restarts both countdowns.
        markCodeSent();
        form.setValue("code", "");
        form.clearErrors("code");
        toast.success(t("codeResent"));
        setTimeout(() => form.setFocus("code"), 0);
      },
      onError: (error) => {
        const errorCode = error instanceof ApiError ? error.code : undefined;
        switch (errorCode) {
          case RESEND_CODE_ERROR_CODES.tooSoon:
            return setBanner("errorResendTooSoon");
          case RESEND_CODE_ERROR_CODES.limitReached:
            return setBanner("errorResendLimit");
          case RESEND_CODE_ERROR_CODES.locked:
            return setBanner("errorLocked");
          case RESEND_CODE_ERROR_CODES.emailNotSent:
            return setBanner("errorEmailNotSent");
          default:
            return setBanner(fallbackKey(error));
        }
      },
    });
  }

  const submit = form.handleSubmit(onSubmit);

  return (
    <>
      <AuthHeading
        title={t("title")}
        subtitle={t.rich("subtitle", {
          address: email,
          // Show the address so users can spot a typo.
          email: (chunks) => (
            <strong className="font-medium break-all text-foreground">
              {chunks}
            </strong>
          ),
        })}
      />

      <form noValidate onSubmit={submit}>
        <FieldGroup className="gap-5">
          {banner && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-300"
            >
              <CircleAlertIcon className="mt-px size-4 shrink-0" aria-hidden />
              <p>
                {t(banner)}
                {banner === "errorAlreadyVerified" && (
                  <>
                    {" "}
                    <Link href="/login" className={linkClass}>
                      {t("signIn")}
                    </Link>
                  </>
                )}
              </p>
            </div>
          )}

          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="code">{t("codeLabel")}</FieldLabel>
                <InputOTP
                  ref={field.ref}
                  id="code"
                  name={field.name}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    if (fieldState.invalid) form.clearErrors("code");
                  }}
                  onBlur={field.onBlur}
                  // Six digits typed or pasted: verify right away.
                  onComplete={() => submit()}
                  maxLength={VERIFICATION_CODE_LENGTH}
                  pattern={REGEXP_ONLY_DIGITS}
                  autoComplete="one-time-code"
                  autoFocus
                  disabled={isPending || expired}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={cn(
                    "code-validity",
                    fieldState.invalid && "code-error",
                  )}
                  containerClassName="gap-2 sm:gap-3"
                >
                  {[
                    [0, 1, 2],
                    [3, 4, 5],
                  ].map((group, groupIndex) => (
                    <div key={groupIndex} className="contents">
                      {groupIndex > 0 && (
                        <InputOTPSeparator className="text-muted-foreground" />
                      )}
                      <InputOTPGroup>
                        {group.map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            aria-invalid={fieldState.invalid}
                            className="size-11 text-lg tabular-nums sm:size-12"
                          />
                        ))}
                      </InputOTPGroup>
                    </div>
                  ))}
                </InputOTP>

                {fieldState.error?.message && (
                  <FieldError id="code-error">
                    {errorText(fieldState.error.message)}
                  </FieldError>
                )}

                {/* Not a live region: it would be read out every second.
                    Expiry itself is announced once, below. */}
                <p
                  id="code-validity"
                  className={cn(
                    "flex items-center gap-2 text-sm tabular-nums transition-colors duration-200",
                    validFor <= EXPIRY_WARNING_SECONDS
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  <ClockIcon aria-hidden className="size-4 shrink-0" />
                  {expired ? (
                    <span role="status">{t("codeExpired")}</span>
                  ) : (
                    t.rich("codeValidFor", {
                      time: formatSeconds(validFor),
                      strong: (chunks) => (
                        <strong className="font-medium text-foreground">
                          {chunks}
                        </strong>
                      ),
                    })
                  )}
                </p>
                <FieldDescription className="text-xs">
                  {t("spamHint")}
                </FieldDescription>
              </Field>
            )}
          />

          {expired ? (
            <Button
              type="button"
              onClick={onResend}
              disabled={resendMutation.isPending}
              aria-busy={resendMutation.isPending}
              className="mt-1 h-11 w-full cursor-pointer rounded-lg text-base font-medium hover:bg-primary/90"
            >
              {resendMutation.isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                  {t("resending")}
                </>
              ) : (
                t("resend")
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="mt-1 h-11 w-full cursor-pointer rounded-lg text-base font-medium hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                  {t("submitting")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          )}
        </FieldGroup>
      </form>

      {!expired && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("noCode")}{" "}
          {resendIn > 0 ? (
            <span className="tabular-nums">
              {t("resendIn", { time: formatSeconds(resendIn) })}
            </span>
          ) : (
            <button
              type="button"
              onClick={onResend}
              disabled={resendMutation.isPending || isPending}
              className={linkClass}
            >
              {resendMutation.isPending ? t("resending") : t("resend")}
            </button>
          )}
        </p>
      )}

      <p className="mt-8 border-t border-border pt-6 text-center text-sm text-pretty text-muted-foreground">
        {t("wrongEmail")}{" "}
        <Link href="/signup" onClick={clearVerification} className={linkClass}>
          {t("changeEmail")}
        </Link>
      </p>
    </>
  );
}
