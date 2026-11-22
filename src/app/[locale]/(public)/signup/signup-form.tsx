"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightIcon,
  Building2Icon,
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
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";

import { AuthHeading } from "@/components/layout/auth-heading";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRegisterMutation } from "@/hooks/use-register-mutation";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import {
  normalizePhone,
  registerSchema,
  type RegisterFormValues,
  type RegisterInput,
} from "@/schemas/auth";
import { REGISTER_ERROR_CODES } from "@/types/auth";

import { ProvinceSelect } from "./province-select";
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

const inputClass = "h-11 rounded-lg pl-9 text-base md:text-sm";

function InputIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within/input:text-primary"
    />
  );
}

export function SignupForm() {
  const t = useTranslations("auth.signup");
  const tValidation = useTranslations("validation");
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegisterMutation();
  const queryClient = useQueryClient();

  const form = useForm<RegisterFormValues, unknown, RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      provinceId: "",
      city: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

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
          [REGISTER_ERROR_CODES.provinceNotFound]: ["provinceId", "errorProvinceNotFound"],
        };
        const conflict = error.code ? fieldConflicts[error.code] : undefined;
        if (conflict) {
          const [name, key] = conflict;
          // The list is stale: fetch it again so the removed province disappears.
          if (name === "provinceId") {
            void queryClient.invalidateQueries({ queryKey: queryKeys.provinces.all });
          }
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
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-300"
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

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
            <Controller
              name="provinceId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="provinceId">{t("provinceLabel")}</FieldLabel>
                  <ProvinceSelect
                    id="provinceId"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    invalid={fieldState.invalid}
                    describedBy={fieldState.invalid ? "provinceId-error" : undefined}
                    disabled={isPending}
                  />
                  {fieldState.error?.message && (
                    <FieldError id="provinceId-error">
                      {errorText(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              name="city"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="city">{t("cityLabel")}</FieldLabel>
                  <div className="group/input relative">
                    <InputIcon icon={Building2Icon} />
                    <Input
                      {...field}
                      id="city"
                      autoComplete="address-level2"
                      placeholder={t("cityPlaceholder")}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={fieldState.invalid ? "city-error" : undefined}
                      disabled={isPending}
                      className={inputClass}
                    />
                  </div>
                  {fieldState.error?.message && (
                    <FieldError id="city-error">
                      {errorText(fieldState.error.message)}
                    </FieldError>
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="password"
            control={form.control}
            // Re-check the confirmation when the password changes.
            rules={{ deps: "confirmPassword" }}
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
                    aria-describedby={
                      fieldState.invalid ? "password-error" : undefined
                    }
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
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirmPassword">
                  {t("confirmPasswordLabel")}
                </FieldLabel>
                <div className="group/input relative">
                  <InputIcon icon={LockIcon} />
                  <Input
                    {...field}
                    id="confirmPassword"
                    // Follows the show/hide toggle of the password field.
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={t("confirmPasswordPlaceholder")}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? "confirmPassword-error" : undefined
                    }
                    disabled={isPending}
                    className={inputClass}
                  />
                </div>
                {fieldState.error?.message && (
                  <FieldError id="confirmPassword-error">
                    {errorText(fieldState.error.message)}
                  </FieldError>
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="group/submit mt-1 h-11 w-full cursor-pointer rounded-lg text-base font-medium hover:bg-primary/90"
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
          className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {t("signIn")}
        </Link>
      </p>
    </>
  );
}
