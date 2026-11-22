"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, Loader2Icon, MailIcon } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthHeading } from "@/components/layout/auth-heading";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import {
  VERIFICATION_CODE_LENGTH,
  verifyEmailSchema,
  type VerifyEmailFormValues,
  type VerifyEmailInput,
} from "@/schemas/auth";
import { useVerificationStore } from "@/stores/verification-store";
import {
  RESEND_CODE_ERROR_CODES,
  VERIFY_EMAIL_ERROR_CODES,
} from "@/types/auth";

/** The API sends at most one code per minute. */
const RESEND_COOLDOWN_SECONDS = 60;

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

/** Seconds left before a new code can be requested. */
function useResendCooldown(codeSentAt: number | null) {
  const [now, setNow] = useState(() => Date.now());
  const elapsed = codeSentAt === null ? Infinity : (now - codeSentAt) / 1000;
  const remaining = Math.min(
    RESEND_COOLDOWN_SECONDS,
    Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed)),
  );
  const active = remaining > 0;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active, codeSentAt]);

  return remaining;
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
  return <VerifyEmailContent />;
}

function VerifyEmailContent() {
  const t = useTranslations("auth.verifyEmail");
  const tValidation = useTranslations("validation");
  const router = useRouter();

  const storedEmail = useVerificationStore((state) => state.email);
  const codeSentAt = useVerificationStore((state) => state.codeSentAt);
  const markCodeSent = useVerificationStore((state) => state.markCodeSent);
  const clearVerification = useVerificationStore((state) => state.clear);
  // Read once: a successful verification clears the store, and the email
  // field must not pop up while the page redirects.
  const [knownEmail] = useState(storedEmail);

  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationCodeMutation();
  const [banner, setBanner] = useState<BannerKey | null>(null);
  const cooldown = useResendCooldown(codeSentAt);

  const form = useForm<VerifyEmailFormValues, unknown, VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: knownEmail ?? "", code: "" },
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

  function onSubmit(values: VerifyEmailInput) {
    setBanner(null);
    verifyMutation.mutate(values, {
      onSuccess: () => {
        clearVerification();
        toast.success(t("success"));
        router.replace("/");
      },
      onError: (error) => {
        const code = error instanceof ApiError ? error.code : undefined;
        switch (code) {
          case VERIFY_EMAIL_ERROR_CODES.invalid:
            return rejectCode(
              knownEmail ? "errorCodeIncorrect" : "errorCodeOrEmailIncorrect",
            );
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
    });
  }

  async function onResend() {
    setBanner(null);
    let email = knownEmail;
    if (!email) {
      // Unknown email (page opened directly): it must be valid first.
      if (!(await form.trigger("email"))) return;
      email = verifyEmailSchema.shape.email.parse(form.getValues("email"));
    }

    resendMutation.mutate(email, {
      onSuccess: () => {
        markCodeSent();
        form.setValue("code", "");
        form.clearErrors("code");
        toast.success(t("codeResent"));
        setTimeout(() => form.setFocus("code"), 0);
      },
      onError: (error) => {
        const code = error instanceof ApiError ? error.code : undefined;
        switch (code) {
          case RESEND_CODE_ERROR_CODES.tooSoon:
            markCodeSent();
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
        subtitle={
          knownEmail
            ? t.rich("subtitleWithEmail", {
                address: knownEmail,
                // Show the address so users can spot a typo.
                email: (chunks) => (
                  <strong className="font-medium break-all text-foreground">
                    {chunks}
                  </strong>
                ),
              })
            : t("subtitle")
        }
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

          {!knownEmail && (
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">{t("emailLabel")}</FieldLabel>
                  <div className="group/input relative">
                    <MailIcon
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within/input:text-primary"
                    />
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoFocus
                      spellCheck={false}
                      placeholder={t("emailPlaceholder")}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={fieldState.invalid ? "email-error" : undefined}
                      disabled={isPending}
                      className="h-11 rounded-lg pl-9 text-base md:text-sm"
                    />
                  </div>
                  {fieldState.error?.message && (
                    <FieldError id="email-error">
                      {errorText(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />
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
                  autoFocus={Boolean(knownEmail)}
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? "code-error" : "code-hint"}
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
                {fieldState.error?.message ? (
                  <FieldError id="code-error">
                    {errorText(fieldState.error.message)}
                  </FieldError>
                ) : (
                  <FieldDescription id="code-hint" className="text-xs">
                    {t("codeHint")}
                  </FieldDescription>
                )}
              </Field>
            )}
          />

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
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("noCode")}{" "}
        {cooldown > 0 ? (
          <span className="tabular-nums">
            {t("resendIn", { time: formatSeconds(cooldown) })}
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

      <p className="mt-8 border-t border-border pt-6 text-center text-sm text-pretty text-muted-foreground">
        {knownEmail ? (
          <>
            {t("wrongEmail")}{" "}
            <Link href="/signup" onClick={clearVerification} className={linkClass}>
              {t("changeEmail")}
            </Link>
          </>
        ) : (
          <>
            {t("alreadyActive")}{" "}
            <Link href="/login" className={linkClass}>
              {t("signIn")}
            </Link>
          </>
        )}
      </p>
    </>
  );
}
