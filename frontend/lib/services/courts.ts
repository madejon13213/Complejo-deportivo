import { apiFetch } from "@/lib/api";
import { Court } from "@/lib/types";

export function getCourts() {
  return apiFetch<Court[]>("/courts/getAll", { method: "GET", cache: "no-store" });
}

export function getCourtById(courtId: number) {
  return apiFetch<Court>(`/courts/${courtId}`, { method: "GET", cache: "no-store" });
}

export function getCourtsByType(typeId: number) {
  return apiFetch<Court[]>(`/courts/type/${typeId}`, { method: "GET", cache: "no-store" });
}
