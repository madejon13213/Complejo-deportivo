"use client";

import { Bell } from "lucide-react";

import Button from "@/app/components/UI/Button";
import { useAuth } from "@/context/AuthContext";

export default function NotificationsBanner() {
  const { isAuthenticated, notifications, markNotificationAsRead } = useAuth();

  if (!isAuthenticated || notifications.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto mt-3 w-full max-w-7xl space-y-2 px-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-amber-100"
        >
          <p className="inline-flex items-center gap-2 text-sm">
            <Bell size={16} />
            {notification.mensaje}
          </p>
          <Button
            variant="secondary"
            onClick={() => markNotificationAsRead(notification.id)}
            className="!px-3 !py-1 text-xs"
          >
            Marcar como leída
          </Button>
        </div>
      ))}
    </section>
  );
}
