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
    <div className="text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-muted">
        <MailCheckIcon aria-hidden className="size-7 text-primary" />
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
