import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

// Locale routing only: URLs without a locale prefix redirect to /fr/...
// With localePrefix "always", next-intl never rewrites.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals and every file with an extension
  // (sw.js, manifest.webmanifest, icons, fonts...) so PWA assets are never touched.
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
