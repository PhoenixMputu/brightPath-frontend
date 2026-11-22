"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { verifyEmail } from "@/services/auth";

// A successful verification opens a session: refresh anything auth-related.
export function useVerifyEmailMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyEmail,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),
  });
}
