import { apiFetch } from "@/lib/api";
import { Notification } from "@/lib/types";

export function getUnreadNotifications() {
  return apiFetch<Notification[]>("/notifications/unread", { method: "GET", cache: "no-store" });
}

export function markNotificationRead(notificationId: number) {
  return apiFetch<Notification>("/notifications/mark-read", {
    method: "POST",
    body: JSON.stringify({ notification_id: notificationId }),
  });
}
