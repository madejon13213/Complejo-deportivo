import { apiFetch } from "@/lib/api";
import {
  Reservation,
  ReservationCreatePayload,
  ReservationSearchResponse,
} from "@/lib/types";

export function getAllReservations() {
  return apiFetch<Reservation[]>("/reservations/getAll", { method: "GET", cache: "no-store" });
}

export function getActiveReservations() {
  return apiFetch<Reservation[]>("/reservations/active", { method: "GET", cache: "no-store" });
}

export function getReservationsByUser(userId: number) {
  return apiFetch<Reservation[]>(`/reservations/user/${userId}`, { method: "GET", cache: "no-store" });
}

export function getReservationsByUserAsAdmin(userId: number) {
  return apiFetch<Reservation[]>(`/admin/users/${userId}/reservations`, { method: "GET", cache: "no-store" });
}

export function getReservationsBySpace(spaceId: number) {
  return apiFetch<Reservation[]>(`/reservations/space/${spaceId}`, { method: "GET", cache: "no-store" });
}

export function searchReservations(params: {
  fecha?: string;
  usuario?: string;
  page?: number;
  limit?: number;
}) {
  const search = new URLSearchParams();

  if (params.fecha) search.set("fecha", params.fecha);
  if (params.usuario) search.set("usuario", params.usuario);
  search.set("page", String(params.page ?? 1));
  search.set("limit", String(params.limit ?? 20));

  return apiFetch<ReservationSearchResponse>(`/reservations/search?${search.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}

export function createReservation(payload: ReservationCreatePayload) {
  return apiFetch<Reservation>("/reservations/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function cancelReservation(reservationId: number) {
  return apiFetch<{ mensaje?: string }>(`/reservations/delete/${reservationId}`, { method: "DELETE" });
}