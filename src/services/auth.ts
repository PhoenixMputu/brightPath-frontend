import { apiFetch } from "@/lib/api-client";
import type { LoginInput } from "@/schemas/auth";

export type LoginResponse = {
  user: {
    id: string;
    email: string;
  };
};

// The session itself is set by the API as an HTTP-only cookie.
export function login(input: LoginInput) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: input,
  });
}
