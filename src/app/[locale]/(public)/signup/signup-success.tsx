"use client";

import { ArrowLeftIcon, MailCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Shown once the account is created: the user must now verify the email. */
export function SignupSuccess({ email }: { email: string }) {
  const t = useTranslations("auth.signup");
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the new content so screen readers announce it.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="text-center motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500">
      <div className="relative mx-auto mb-7 flex size-20 items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-primary/10 motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-700"
        />
        <span
          aria-hidden
          className="absolute inset-2 rounded-full bg-primary/15 motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-700 motion-safe:delay-100 motion-safe:fill-mode-both"
        />
        <MailCheckIcon
          aria-hidden
          className="relative size-9 text-primary motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:delay-200 motion-safe:fill-mode-both"
        />
        <span
          aria-hidden
          className="absolute top-1 right-1 size-3 rounded-full bg-brand-yellow shadow-[0_0_0_4px_rgb(247_196_0/0.2)] motion-safe:animate-in motion-safe:zoom-in-0 motion-safe:duration-500 motion-safe:delay-500 motion-safe:fill-mode-both"
        />
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-3xl font-semibold tracking-tight text-balance outline-none"
      >
        {t("successTitle")}
      </h1>
      <p className="mt-3 text-base text-pretty text-muted-foreground">
        {t.rich("successDescription", {
          address: email,
          // Highlight the address so users can spot a typo.
          email: (chunks) => (
            <strong className="font-semibold break-all text-foreground">
              {chunks}
            </strong>
          ),
        })}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{t("successHint")}</p>

      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "mt-8 h-11 w-full rounded-lg text-base",
        )}
      >
        <ArrowLeftIcon aria-hidden className="size-4" />
        {t("backToLogin")}
      </Link>
    </div>
  );
}
