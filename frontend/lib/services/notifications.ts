import { apiFetch } from "@/lib/api";
import { Notification } from "@/lib/types";

export function getUnreadNotifications() {
  return apiFetch<Notification[]>("/notifications/unread", { method: "GET", cache: "no-store" });
}

export function getMyNotifications(limit = 25) {
  return apiFetch<Notification[]>(`/notifications/my?limit=${limit}`, { method: "GET", cache: "no-store" });
}

export function markNotificationRead(notificationId: number) {
  return apiFetch<Notification>(`/notifications/${notificationId}/read`, {
    method: "PUT",
  });
}

export function markNotificationReadLegacy(notificationId: number) {
  return apiFetch<Notification>("/notifications/mark-read", {
    method: "POST",
    body: JSON.stringify({ notification_id: notificationId }),
  });
}