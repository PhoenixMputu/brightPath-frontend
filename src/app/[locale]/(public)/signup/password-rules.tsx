"use client";

import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { passwordRules, type PasswordRule } from "@/schemas/auth";

const RULE_LABELS: Record<PasswordRule, string> = {
  length: "ruleLength",
  uppercase: "ruleUppercase",
  lowercase: "ruleLowercase",
  digit: "ruleDigit",
};

/** Live checklist of the API's password rules. */
export function PasswordRules({ id, value }: { id: string; value: string }) {
  const t = useTranslations("auth.signup");
  const rules = Object.keys(passwordRules) as PasswordRule[];

  return (
    <div id={id} className="rounded-lg bg-muted/60 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">
        {t("passwordRulesTitle")}
      </p>
      <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {rules.map((rule) => {
          const met = passwordRules[rule](value);
          return (
            <li
              key={rule}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors duration-200",
                met ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                  met
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background",
                )}
              >
                <CheckIcon
                  className={cn(
                    "size-2.5 transition-opacity duration-200",
                    met ? "opacity-100" : "opacity-0",
                  )}
                  strokeWidth={3}
                />
              </span>
              {t(RULE_LABELS[rule])}
              <span className="sr-only">
                ({met ? t("ruleMet") : t("ruleNotMet")})
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
