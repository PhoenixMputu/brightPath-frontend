import { apiFetch } from "@/lib/api-client";
import type { LoginInput, RegisterPayload } from "@/schemas/auth";
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
export function register(input: RegisterPayload) {
  // Pick the fields explicitly so form-only values never reach the API.
  const body: RegisterPayload = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    provinceId: input.provinceId,
    city: input.city,
    password: input.password,
  };
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body,
  });
}
