import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthShell } from "@/components/layout/auth-shell";

import { VerifyEmailForm } from "./verify-email-form";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/verify-email">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.verifyEmail" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function VerifyEmailPage({
  params,
}: PageProps<"/[locale]/verify-email">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthShell>
      <VerifyEmailForm />
    </AuthShell>
  );
}
