import { getTranslations } from "next-intl/server";

import { BrandPanel } from "@/components/layout/brand-panel";
import { BrandLogo } from "@/components/shared/brand-logo";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: React.ReactNode;
  /** Max width of the form column. */
  size?: "sm" | "md";
};

/** Two-column layout shared by the auth pages: brand panel + form column. */
export async function AuthShell({ children, size = "sm" }: AuthShellProps) {
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
          <div
            className={cn(
              "w-full motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:fill-mode-both",
              size === "sm" ? "max-w-[400px]" : "max-w-[460px]",
            )}
          >
            {children}
          </div>
        </div>

        <footer className="relative text-center text-xs text-muted-foreground lg:hidden">
          {tCommon("copyright", { year: new Date().getFullYear() })}
        </footer>
      </main>
    </div>
  );
}
