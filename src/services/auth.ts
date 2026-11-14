import { apiFetch } from "@/lib/api-client";
import type { LoginInput, RegisterInput } from "@/schemas/auth";
import type { RegisterResponse } from "@/types/auth";

export type LoginResponse = {
  user: {
    id: string;
    email: string;
  };
};

// The API has no login endpoint yet: this path is a placeholder until it exists.
// The session itself will be set by the API as an HTTP-only cookie.
export function login(input: LoginInput) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: input,
  });
}

/** POST /auth/register: creates an INACTIVE user and emails a 6-digit code. */
export function register(input: RegisterInput) {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: input,
  });
}
