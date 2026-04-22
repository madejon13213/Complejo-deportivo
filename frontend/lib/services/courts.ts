import { apiFetch } from "@/lib/api";
import { Court } from "@/lib/types";

export function getCourts() {
  return apiFetch<Court[]>("/courts/getAll", { method: "GET", cache: "no-store" });
}
