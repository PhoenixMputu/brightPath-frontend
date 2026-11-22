import type { ProvincesQuery } from "@/types/province";

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },
  provinces: {
    all: ["provinces"] as const,
    list: (query: ProvincesQuery) =>
      [...queryKeys.provinces.all, "list", query] as const,
  },
};
