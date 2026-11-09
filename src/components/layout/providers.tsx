"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

import { Toaster } from "@/components/ui/sonner";

// next-themes renders an inline <script> that applies the theme before first
// paint. It only needs to run from the server HTML. When React creates it on
// the client (e.g. the root layout re-rendering on a locale switch), it never
// runs and React 19 logs "Encountered a script tag". Marking it as a data block
// on the client silences that; next-themes already sets suppressHydrationWarning
// on the tag, so the differing `type` does not cause a hydration error.
const themeScriptProps = {
  type: typeof window === "undefined" ? "text/javascript" : "application/json",
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000 } },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={themeScriptProps}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
