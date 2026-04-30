import { apiFetch } from "@/lib/api";
import { SpaceType, SpaceTypeSearchResponse } from "@/lib/types";

export function getSpaces(page: number = 1, limit: number = 10) {
  const search = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch<SpaceTypeSearchResponse>(`/spaces/getAll?${search.toString()}`, { 
    method: "GET", 
    cache: "no-store" 
  });
}
export function getAllSpaces() {
  return apiFetch<SpaceType[]>(`/spaces/types`, { method: "GET", cache: "no-store" });
}
