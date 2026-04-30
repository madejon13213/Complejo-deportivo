"use client";

import { Bell } from "lucide-react";

import Sidebar from "@/app/components/Layout/Sidebar";
import Spinner from "@/app/components/UI/Spinner";
import { useAuth } from "@/context/AuthContext";

function formatNotificationType(type: string) {
  return type.replaceAll("_", " ");
}

export default function NotificationsPage() {
  const { isReady, notifications, unreadNotificationsCount, markNotificationAsRead } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <Sidebar />
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <header className="space-y-2">
          <h1 className="text-4xl text-white">Notificaciones</h1>
          <p className="text-sm text-gray-300">Aquí puedes revisar tus avisos del sistema.</p>
        </header>

        <section className="rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
              <Bell size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">No leídas</p>
              <p className="text-xs text-gray-300">{unreadNotificationsCount} pendientes</p>
            </div>
          </div>

          {!isReady && <Spinner />}

          {isReady && notifications.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-gray-300">
              No tienes notificaciones.
            </div>
          )}

          <div className="space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={async () => {
                  await markNotificationAsRead(notification.id);
                }}
                className="w-full rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-left text-white transition"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-[#9bb3ff]">
                  {formatNotificationType(notification.tipo)}
                </div>
                <div className="mt-1 text-sm leading-6">{notification.mensaje}</div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}