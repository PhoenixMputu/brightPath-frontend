import { defineRouting } from "next-intl/routing";

// French is served without a prefix (/login), other locales with one (/en/login).
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
