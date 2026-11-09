"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("common");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeLocale(locale: Locale) {
    if (locale === currentLocale) return;
    // Same page, other locale: /login <-> /en/login.
    startTransition(() => router.replace(pathname, { locale }));
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-background/60 p-0.5 text-xs font-semibold backdrop-blur transition-opacity",
        isPending && "opacity-60",
        className,
      )}
    >
      {routing.locales.map((locale) => {
        const active = locale === currentLocale;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={active}
            disabled={isPending}
            onClick={() => changeLocale(locale)}
            className={cn(
              "min-w-10 cursor-pointer rounded-full px-2.5 py-1.5 uppercase tracking-wide transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
