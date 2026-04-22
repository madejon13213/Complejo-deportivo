import { apiFetch } from "@/lib/api";
import { Reservation, ReservationCreatePayload } from "@/lib/types";

export function getAllReservations() {
  return apiFetch<Reservation[]>("/reservations/getAll", { method: "GET", cache: "no-store" });
}

export function getActiveReservations() {
  return apiFetch<Reservation[]>("/reservations/active", { method: "GET", cache: "no-store" });
}

export function getReservationsByUser(userId: number) {
  return apiFetch<Reservation[]>(`/reservations/user/${userId}`, { method: "GET", cache: "no-store" });
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
