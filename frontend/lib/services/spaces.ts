import { apiFetch } from "@/lib/api";
import { SpaceType } from "@/lib/types";

export function getSpaces() {
  return apiFetch<SpaceType[]>("/spaces/getAll", { method: "GET", cache: "no-store" });
}
