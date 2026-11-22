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

/** Error codes the API sends in the `code` field of a register error. */
export const REGISTER_ERROR_CODES = {
  emailInUse: "EMAIL_ALREADY_IN_USE",
  phoneInUse: "PHONE_ALREADY_IN_USE",
  userExists: "USER_ALREADY_EXISTS",
  emailNotSent: "VERIFICATION_EMAIL_NOT_SENT",
  provinceNotFound: "PROVINCE_NOT_FOUND",
} as const;
