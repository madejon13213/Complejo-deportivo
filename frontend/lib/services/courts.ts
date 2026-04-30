import { apiFetch } from "@/lib/api";
import { Court, CourtSearchResponse } from "@/lib/types";

export interface CourtFilters {
  search?: string;
  typeId?: number;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
}

export function getCourts(page: number = 1, limit: number = 10, filters: CourtFilters = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.search) params.append("search", filters.search);
  if (filters.typeId) params.append("type_id", String(filters.typeId));
  if (filters.minPrice) params.append("min_price", String(filters.minPrice));
  if (filters.maxPrice) params.append("max_price", String(filters.maxPrice));
  if (filters.minCapacity) params.append("min_capacity", String(filters.minCapacity));

  return apiFetch<CourtSearchResponse>(`/courts/getAll?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}

export function getCourtById(courtId: number) {
  return apiFetch<Court>(`/courts/${courtId}`, { method: "GET", cache: "no-store" });
}

export function getCourtsByType(typeId: number, page: number = 1, limit: number = 10) {
  const search = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch<CourtSearchResponse>(`/courts/type/${typeId}?${search.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}
