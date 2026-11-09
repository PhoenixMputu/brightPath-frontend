import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

// Locale routing only. For the default locale (fr) next-intl rewrites
// /login to /fr/login internally: this is the one rewrite allowed in AGENTS.md.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals and every file with an extension
  // (sw.js, manifest.webmanifest, icons, fonts...) so PWA assets are never touched.
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
