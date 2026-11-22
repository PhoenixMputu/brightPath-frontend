"use client";

import { useMutation } from "@tanstack/react-query";

import { resendVerificationCode } from "@/services/auth";

export function useResendVerificationCodeMutation() {
  return useMutation({ mutationFn: resendVerificationCode });
}
