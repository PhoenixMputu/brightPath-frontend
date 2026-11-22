// Shapes returned by the BrightPath API (see /docs on the backend).

import type { Province } from "@/types/province";

export type UserStatus = "ACTIVE" | "INACTIVE" | (string & {});

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  province: Province;
  city: string;
  /** INACTIVE until the email is verified. */
  status: UserStatus;
  createdAt: string;
};

export type RegisterResponse = {
  message: string;
  data: User;
};

export type VerifyEmailResponse = {
  message: string;
  /** The user, now ACTIVE. The session tokens are set as httpOnly cookies. */
  data: User;
};

export type MessageResponse = {
  message: string;
};

/** Error codes the API sends in the `code` field of a register error. */
export const REGISTER_ERROR_CODES = {
  emailInUse: "EMAIL_ALREADY_IN_USE",
  phoneInUse: "PHONE_ALREADY_IN_USE",
  userExists: "USER_ALREADY_EXISTS",
  emailNotSent: "VERIFICATION_EMAIL_NOT_SENT",
  provinceNotFound: "PROVINCE_NOT_FOUND",
} as const;

/** Error codes of POST /auth/verify-email. */
export const VERIFY_EMAIL_ERROR_CODES = {
  invalid: "OTP_INVALID",
  expired: "OTP_EXPIRED",
  alreadyVerified: "EMAIL_ALREADY_VERIFIED",
  tooManyAttempts: "OTP_TOO_MANY_ATTEMPTS",
  locked: "OTP_VERIFICATION_LOCKED",
  sessionNotOpened: "SESSION_NOT_OPENED",
} as const;

/** Error codes of POST /auth/resend-verification-code. */
export const RESEND_CODE_ERROR_CODES = {
  tooSoon: "OTP_RESEND_TOO_SOON",
  limitReached: "OTP_RESEND_LIMIT_REACHED",
  locked: "OTP_VERIFICATION_LOCKED",
  emailNotSent: "VERIFICATION_EMAIL_NOT_SENT",
} as const;
