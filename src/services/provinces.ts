import { apiFetch } from "@/lib/api-client";
import type { ProvincesQuery, ProvincesResponse } from "@/types/province";

/** GET /provinces: public, paginated list of provinces. */
export function listProvinces(query: ProvincesQuery = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const search = params.size > 0 ? `?${params}` : "";
  return apiFetch<ProvincesResponse>(`/provinces${search}`);
}
