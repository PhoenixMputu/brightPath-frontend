import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthHeading } from "@/components/layout/auth-heading";
import { AuthShell } from "@/components/layout/auth-shell";
import { Link } from "@/i18n/navigation";

import { LoginForm } from "./login-form";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function LoginPage({
  params,
}: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("auth.login");

  return (
    <AuthShell>
      <AuthHeading title={t("title")} subtitle={t("subtitle")} />

      <LoginForm />

      <p className="mt-8 border-t border-border pt-6 text-center text-sm text-pretty text-muted-foreground">
        {t("noAccount")}{" "}
        <Link
          href="/signup"
          className="rounded-sm font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {t("createAccount")}
        </Link>
      </p>
    </AuthShell>
  );
}
