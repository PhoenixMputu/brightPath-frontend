"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightIcon,
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";

import { AuthHeading } from "@/components/layout/auth-heading";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRegisterMutation } from "@/hooks/use-register-mutation";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  normalizePhone,
  registerSchema,
  type RegisterFormValues,
  type RegisterInput,
} from "@/schemas/auth";
import { REGISTER_ERROR_CODES } from "@/types/auth";

import { PasswordRules } from "./password-rules";
import { SignupSuccess } from "./signup-success";

// Field errors are translation keys. Keys starting with "signup." come from
// API conflicts (auth.signup namespace); the others are Zod validation keys.
const SERVER_PREFIX = "signup.";

function bannerKey(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === REGISTER_ERROR_CODES.userExists) return "errorUserExists";
    if (error.code === REGISTER_ERROR_CODES.emailNotSent) return "errorEmailNotSent";
    if (error.status === 400) return "errorInvalid";
    return "errorGeneric";
  }
  // fetch() rejects with a TypeError when the server can't be reached.
  return error instanceof TypeError ? "errorNetwork" : "errorGeneric";
}

const inputClass = "h-11 rounded-lg pl-10 text-base md:text-sm";

function InputIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within/input:text-primary"
    />
  );
}

export function SignupForm() {
  const t = useTranslations("auth.signup");
  const tValidation = useTranslations("validation");
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegisterMutation();

  const form = useForm<RegisterFormValues, unknown, RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
    mode: "onTouched",
  });

  const password = useWatch({ control: form.control, name: "password" });
  const isPending = registerMutation.isPending;

  function errorText(message: string) {
    return message.startsWith(SERVER_PREFIX)
      ? t(message.slice(SERVER_PREFIX.length))
      : tValidation(message);
  }

  function onSubmit(values: RegisterInput) {
    registerMutation.mutate(values, {
      onError: (error) => {
        if (!(error instanceof ApiError)) return;
        // Conflicts point to one field: show them right under it.
        const fieldConflicts: Record<string, [FieldPath<RegisterFormValues>, string]> = {
          [REGISTER_ERROR_CODES.emailInUse]: ["email", "errorEmailInUse"],
          [REGISTER_ERROR_CODES.phoneInUse]: ["phone", "errorPhoneInUse"],
        };
        const conflict = error.code ? fieldConflicts[error.code] : undefined;
        if (conflict) {
          const [name, key] = conflict;
          form.setError(name, {
            type: "server",
            message: `${SERVER_PREFIX}${key}`,
          });
          registerMutation.reset();
          // Inputs are disabled while the request is pending: focus the field
          // once the form is enabled again.
          setTimeout(() => form.setFocus(name, { shouldSelect: true }), 0);
        }
      },
    });
  }

  if (registerMutation.isSuccess) {
    return <SignupSuccess email={registerMutation.data.data.email} />;
  }

  return (
    <>
      <AuthHeading title={t("title")} subtitle={t("subtitle")} />

      <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="gap-5">
          {registerMutation.isError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-300"
            >
              <CircleAlertIcon className="mt-px size-4 shrink-0" aria-hidden />
              <p>{t(bannerKey(registerMutation.error))}</p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
            {(["firstName", "lastName"] as const).map((name, index) => (
              <Controller
                key={name}
                name={name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>{t(`${name}Label`)}</FieldLabel>
                    <div className="group/input relative">
                      <InputIcon icon={UserIcon} />
                      <Input
                        {...field}
                        id={name}
                        autoComplete={name === "firstName" ? "given-name" : "family-name"}
                        autoFocus={index === 0}
                        placeholder={t(`${name}Placeholder`)}
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.invalid ? `${name}-error` : undefined}
                        disabled={isPending}
                        className={inputClass}
                      />
                    </div>
                    {fieldState.error?.message && (
                      <FieldError id={`${name}-error`}>
                        {errorText(fieldState.error.message)}
                      </FieldError>
                    )}
                  </Field>
                )}
              />
            ))}
          </div>

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">{t("emailLabel")}</FieldLabel>
                <div className="group/input relative">
                  <InputIcon icon={MailIcon} />
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    placeholder={t("emailPlaceholder")}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? "email-error" : undefined}
                    disabled={isPending}
                    className={inputClass}
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

          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="phone">{t("phoneLabel")}</FieldLabel>
                <div className="group/input relative">
                  <InputIcon icon={PhoneIcon} />
                  <Input
                    {...field}
                    onBlur={() => {
                      // Show the number as it will be sent (E.164).
                      if (field.value.trim()) field.onChange(normalizePhone(field.value.trim()));
                      field.onBlur();
                    }}
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={t("phonePlaceholder")}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? "phone-error phone-hint" : "phone-hint"}
                    disabled={isPending}
                    className={inputClass}
                  />
                </div>
                {fieldState.error?.message ? (
                  <FieldError id="phone-error">
                    {errorText(fieldState.error.message)}
                  </FieldError>
                ) : (
                  <FieldDescription id="phone-hint" className="text-xs">
                    {t("phoneHint")}
                  </FieldDescription>
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">{t("passwordLabel")}</FieldLabel>
                <div className="group/input relative">
                  <InputIcon icon={LockIcon} />
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={t("passwordPlaceholder")}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={cn(
                      "password-rules",
                      fieldState.invalid && "password-error",
                    )}
                    disabled={isPending}
                    className={cn(inputClass, "pr-11")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                    aria-pressed={showPassword}
                    aria-controls="password"
                    className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" aria-hidden />
                    ) : (
                      <EyeIcon className="size-4" aria-hidden />
                    )}
                  </button>
                </div>
                {fieldState.error?.message && (
                  <FieldError id="password-error">
                    {errorText(fieldState.error.message)}
                  </FieldError>
                )}
                <PasswordRules id="password-rules" value={password} />
              </Field>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="group/submit mt-1 h-11 w-full cursor-pointer rounded-lg text-base font-semibold shadow-[0_1px_2px_rgb(0_0_0/0.06),0_8px_24px_-8px_var(--color-primary)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-primary/90 hover:shadow-[0_1px_2px_rgb(0_0_0/0.06),0_12px_28px_-8px_var(--color-primary)]"
          >
            {isPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
                {t("submitting")}
              </>
            ) : (
              <>
                {t("submit")}
                <ArrowRightIcon
                  aria-hidden
                  className="size-4 transition-transform duration-200 group-hover/submit:translate-x-0.5"
                />
              </>
            )}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-center text-sm text-pretty text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="rounded-sm font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {t("signIn")}
        </Link>
      </p>
    </>
  );
}
