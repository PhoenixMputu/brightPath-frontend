import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { BrandLogo } from "@/components/shared/brand-logo";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";

import { BrandPanel } from "./brand-panel";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  const tCommon = await getTranslations("common");

  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <BrandPanel />

      <main className="relative flex flex-col px-4 py-5 sm:px-8 lg:px-12">
        {/* Soft brand light behind the form. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent)]"
        />

        <header className="relative flex items-center justify-between gap-4">
          <BrandLogo width={132} priority className="lg:invisible" />
          <div className="flex items-center gap-1.5">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <div className="relative flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:fill-mode-both">
            <div className="mb-8">
              <span
                aria-hidden
                className="mb-5 block size-2.5 rounded-full bg-brand-yellow shadow-[0_0_0_5px_rgb(247_196_0/0.2)] motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:fade-in motion-safe:duration-500 motion-safe:delay-300 motion-safe:fill-mode-both"
              />
              <h1 className="text-3xl font-semibold tracking-tight text-balance">
                {t("title")}
              </h1>
              <p className="mt-2 text-base text-pretty text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>

            <LoginForm />

            <p className="mt-8 border-t border-border pt-6 text-center text-sm text-pretty text-muted-foreground">
              {t("noAccount")}
            </p>
          </div>
        </div>

        <footer className="relative text-center text-xs text-muted-foreground lg:hidden">
          {tCommon("copyright", { year: new Date().getFullYear() })}
        </footer>
      </main>
    </div>
  );
}
