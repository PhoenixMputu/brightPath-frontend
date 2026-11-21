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
        "inline-flex h-9 items-stretch rounded-lg border border-border p-1 text-xs font-medium transition-opacity",
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
              "min-w-9 cursor-pointer rounded-md px-2 uppercase transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-muted text-foreground"
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
