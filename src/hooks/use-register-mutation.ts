"use client";

import { useMutation } from "@tanstack/react-query";

import { register } from "@/services/auth";

// No query to invalidate: the new account stays INACTIVE (no session)
// until the email is verified.
export function useRegisterMutation() {
  return useMutation({ mutationFn: register });
}
