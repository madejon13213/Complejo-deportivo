import { apiFetch } from "@/lib/api";
import { User } from "@/lib/types";

export function getMe() {
  return apiFetch<User & { rol?: string }>("/users/me", { method: "GET", cache: "no-store" });
}

export function getUsers() {
  return apiFetch<User[]>("/users/getAll", { method: "GET", cache: "no-store" });
}

export function deleteUser(userId: number) {
  return apiFetch<{ mensaje?: string }>(`/users/${userId}`, { method: "DELETE" });
}
