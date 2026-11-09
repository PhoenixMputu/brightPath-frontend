"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

export function ThemeToggle() {
  const t = useTranslations("common");
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  // Keep the same footprint before mount to avoid layout shift.
  if (!mounted) {
    return <div className="size-10" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-10 rounded-full text-muted-foreground hover:text-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("themeLight") : t("themeDark")}
      title={t("themeToggle")}
    >
      {isDark ? (
        <SunIcon className="size-[18px] motion-safe:animate-in motion-safe:spin-in-45 motion-safe:fade-in motion-safe:duration-300" />
      ) : (
        <MoonIcon className="size-[18px] motion-safe:animate-in motion-safe:-spin-in-45 motion-safe:fade-in motion-safe:duration-300" />
      )}
    </Button>
  );
}
