import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type VerificationState = {
  /** Email waiting for verification, set right after signup. */
  email: string | null;
  /** When the last code was sent (ms since epoch), for the resend cooldown. */
  codeSentAt: number | null;
  start: (email: string) => void;
  markCodeSent: () => void;
  clear: () => void;
};

/**
 * Carries the email from the signup page to the verify-email page without
 * putting it in the URL. Kept in sessionStorage so a refresh keeps it, and
 * dropped when the tab closes.
 */
export const useVerificationStore = create<VerificationState>()(
  persist(
    (set) => ({
      email: null,
      codeSentAt: null,
      start: (email) => set({ email, codeSentAt: Date.now() }),
      markCodeSent: () => set({ codeSentAt: Date.now() }),
      clear: () => set({ email: null, codeSentAt: null }),
    }),
    {
      name: "brightpath-verification",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
