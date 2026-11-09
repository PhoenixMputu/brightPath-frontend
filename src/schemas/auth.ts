import { z } from "zod";

// Messages are translation keys from the `validation` namespace,
// resolved in the UI so errors follow the user's locale.
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "emailRequired" })
    .pipe(z.email({ error: "emailInvalid" })),
  password: z.string().min(1, { error: "passwordRequired" }),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
