import { apiFetch } from "@/lib/api";
import { PenalizationCreatePayload, Penalty } from "@/lib/types";

export function getAllPenalties() {
  return apiFetch<Penalty[]>("/penalties/getAll", { method: "GET", cache: "no-store" });
}

export function getPenaltiesByUser(userId: number) {
  return apiFetch<Penalty[]>(`/penalties/user/${userId}`, { method: "GET", cache: "no-store" });
}

export function getPenaltiesByUserAsAdmin(userId: number) {
  return apiFetch<Penalty[]>(`/admin/users/${userId}/penalties`, { method: "GET", cache: "no-store" });
}

export function createPenalty(payload: PenalizationCreatePayload) {
  return apiFetch<Penalty>("/penalties/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}