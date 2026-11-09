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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/hooks/use-login-mutation";
import { ApiError } from "@/lib/api-client";
import { loginSchema, type LoginInput } from "@/schemas/auth";

function errorKey(error: unknown) {
  if (error instanceof ApiError) {
    return error.status === 400 || error.status === 401
      ? "errorInvalidCredentials"
      : "errorGeneric";
  }
  // fetch() rejects with a TypeError when the server can't be reached.
  return error instanceof TypeError ? "errorNetwork" : "errorGeneric";
}

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
    mode: "onTouched",
  });

  function onSubmit(values: LoginInput) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        toast.success(t("success"));
        router.push("/");
        router.refresh();
      },
    });
  }

  const isPending = loginMutation.isPending;

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        {loginMutation.isError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-300"
          >
            <CircleAlertIcon className="mt-px size-4 shrink-0" aria-hidden />
            <p>{t(errorKey(loginMutation.error))}</p>
          </div>
        )}

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">{t("emailLabel")}</FieldLabel>
              <div className="group/input relative">
                <MailIcon
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within/input:text-primary"
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
                  className="h-11 rounded-lg pl-10 text-base md:text-sm"
                />
              </div>
              {fieldState.error?.message && (
                <FieldError id="email-error">
                  {tValidation(fieldState.error.message)}
                </FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="password">{t("passwordLabel")}</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="rounded-sm text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="group/input relative">
                <LockIcon
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within/input:text-primary"
                />
                <Input
                  {...field}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={t("passwordPlaceholder")}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? "password-error" : undefined
                  }
                  disabled={isPending}
                  className="h-11 rounded-lg pr-11 pl-10 text-base md:text-sm"
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
                  {tValidation(fieldState.error.message)}
                </FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          name="rememberMe"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="gap-2.5">
              <Checkbox
                id="remember-me"
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isPending}
              />
              <FieldLabel
                htmlFor="remember-me"
                className="cursor-pointer font-normal text-muted-foreground"
              >
                {t("rememberMe")}
              </FieldLabel>
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
  );
}
