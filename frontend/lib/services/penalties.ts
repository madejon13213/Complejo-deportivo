import { apiFetch } from "@/lib/api";
import { PenalizationCreatePayload, Penalty, PenaltySearchResponse } from "@/lib/types";

export function getAllPenalties(page: number = 1, limit: number = 10) {
  const search = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch<PenaltySearchResponse>(`/penalties/getAll?${search.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}

export function getPenaltiesByUser(userId: number, page: number = 1, limit: number = 10) {
  const search = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch<PenaltySearchResponse>(`/penalties/user/${userId}?${search.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}

export function getPenaltiesByUserAsAdmin(userId: number, page: number = 1, limit: number = 10) {
  const search = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch<PenaltySearchResponse>(`/admin/users/${userId}/penalties?${search.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}

export function createPenalty(payload: PenalizationCreatePayload) {
  return apiFetch<Penalty>("/penalties/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
