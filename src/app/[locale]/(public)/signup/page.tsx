import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthShell } from "@/components/layout/auth-shell";

import { SignupForm } from "./signup-form";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/signup">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.signup" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function SignupPage({
  params,
}: PageProps<"/[locale]/signup">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthShell size="md">
      <SignupForm />
    </AuthShell>
  );
}
