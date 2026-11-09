import { defineRouting } from "next-intl/routing";

// Every URL carries its locale (/fr/login, /en/login). URLs without a prefix
// redirect to French. Browser language and cookies are ignored, so French is
// always the default; users switch language through the URL.
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
