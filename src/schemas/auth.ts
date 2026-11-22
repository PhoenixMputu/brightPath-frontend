import { z } from "zod";

// Messages are translation keys from the `validation` namespace,
// resolved in the UI so errors follow the user's locale.

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: "emailRequired" })
  .max(254, { error: "emailTooLong" })
  .pipe(z.email({ error: "emailInvalid" }));

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { error: "passwordRequired" }),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Password rules from the API (RegisterDto): 8-128 chars, upper, lower, digit.
export const passwordRules = {
  length: (value: string) => value.length >= 8,
  uppercase: (value: string) => /[A-Z]/.test(value),
  lowercase: (value: string) => /[a-z]/.test(value),
  digit: (value: string) => /\d/.test(value),
} as const;

/**
 * Normalizes a phone number to E.164, as the API expects.
 * Removes spaces, dashes, dots and parentheses; "00" becomes "+";
 * a local DRC number starting with 0 gets the +243 prefix.
 */
export function normalizePhone(value: string) {
  const digits = value.replace(/[\s\-.()]/g, "");
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `+243${digits.slice(1)}`;
  if (/^243\d/.test(digits)) return `+${digits}`;
  return digits;
}

const nameField = (requiredKey: string) =>
  z
    .string()
    .trim()
    .min(1, { error: requiredKey })
    .max(100, { error: "nameTooLong" });

// Not trimmed, as on the API side.
const passwordField = z
  .string()
  .min(8, { error: "passwordTooShort" })
  .max(128, { error: "passwordTooLong" })
  .refine(
    (value) =>
      passwordRules.uppercase(value) &&
      passwordRules.lowercase(value) &&
      passwordRules.digit(value),
    { error: "passwordWeak" },
  );

const passwordPair = z.object({
  password: passwordField,
  confirmPassword: z.string().min(1, { error: "confirmPasswordRequired" }),
});

export const registerSchema = z
  .object({
    firstName: nameField("firstNameRequired"),
    lastName: nameField("lastNameRequired"),
    email: emailField,
    phone: z
      .string()
      .trim()
      .min(1, { error: "phoneRequired" })
      .transform(normalizePhone)
      .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, { error: "phoneInvalid" })),
    // Id of a province from GET /provinces.
    provinceId: z.string().min(1, { error: "provinceRequired" }),
    city: z
      .string()
      .trim()
      .min(1, { error: "cityRequired" })
      .max(100, { error: "cityTooLong" }),
    password: passwordField,
    // Form only: never sent to the API.
    confirmPassword: passwordPair.shape.confirmPassword,
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: "passwordMismatch",
    path: ["confirmPassword"],
    // Compare as soon as both passwords are valid, even if other fields
    // (name, city, ...) still have errors.
    when: (payload) => passwordPair.safeParse(payload.value).success,
  });

/** Values typed in the form (before normalization). */
export type RegisterFormValues = z.input<typeof registerSchema>;
/** Validated form values (trimmed, lowercased email, E.164 phone). */
export type RegisterInput = z.output<typeof registerSchema>;
/** Body of POST /auth/register. */
export type RegisterPayload = Omit<RegisterInput, "confirmPassword">;
