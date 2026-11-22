"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { listProvinces } from "@/services/provinces";
import type { ProvincesQuery } from "@/types/province";

// The DRC has 26 provinces: one page of 30 holds them all.
const ALL_PROVINCES: ProvincesQuery = {
  page: 1,
  limit: 30,
  sortBy: "name",
  order: "asc",
};

/** Every province, sorted by name, for pickers such as the signup form. */
export function useProvincesQuery() {
  return useQuery({
    queryKey: queryKeys.provinces.list(ALL_PROVINCES),
    queryFn: () => listProvinces(ALL_PROVINCES),
    select: (response) => response.data,
    // Provinces rarely change.
    staleTime: 60 * 60 * 1000,
  });
}
