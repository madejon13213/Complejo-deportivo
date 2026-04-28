"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, BarChart3, Bell, Calendar, Dumbbell, Shield, User, Users } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

function formatNotificationType(type: string) {
  return type.replaceAll("_", " ");
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin, notifications, unreadNotificationsCount, markNotificationAsRead } = useAuth();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <BarChart3 size={16} /> },
    { href: "/reservas", label: "Reservas", icon: <Calendar size={16} /> },
    { href: "/courts", label: "Pistas", icon: <Dumbbell size={16} /> },
    { href: "/spaces", label: "Espacios", icon: <Users size={16} /> },
    { href: "/profile", label: "Perfil", icon: <User size={16} /> },
    { href: "/penalties", label: "Penalizaciones", icon: <AlertTriangle size={16} /> },
  ];

  const adminLinks = [
    { href: "/admin/usuarios", label: "Admin usuarios", icon: <Shield size={16} /> },
    { href: "/admin/reservas", label: "Admin reservas", icon: <Shield size={16} /> },
    { href: "/admin/penalizaciones", label: "Admin penalizaciones", icon: <Shield size={16} /> },
  ];

  const visibleLinks = isAdmin ? [...links, ...adminLinks] : links;

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/15 bg-black/35 p-4 backdrop-blur-sm md:block">
      <nav className="space-y-2">
        {visibleLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              pathname.startsWith(item.href)
                ? "bg-[#5c7bff] text-white"
                : "text-gray-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-2">
        <div className="mb-2 flex items-center justify-between px-2">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-100">
            <Bell size={15} />
            Notificaciones
          </div>
          {unreadNotificationsCount > 0 && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
              {unreadNotificationsCount > 9 ? "+9" : unreadNotificationsCount}
            </span>
          )}
        </div>

        <div className="max-h-64 space-y-2 overflow-auto px-1 pb-1">
          {notifications.length === 0 && (
            <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-xs text-gray-300">
              No tienes notificaciones.
            </div>
          )}

          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={async () => {
                if (!notification.leida) {
                  await markNotificationAsRead(notification.id);
                }
              }}
              className={`w-full rounded-lg border px-2 py-2 text-left text-xs transition ${
                notification.leida
                  ? "border-white/10 bg-black/20 text-gray-300"
                  : "border-blue-400/30 bg-blue-500/10 text-white"
              }`}
            >
              <div className="font-semibold uppercase tracking-wide text-[#9bb3ff]">
                {formatNotificationType(notification.tipo)}
              </div>
              <div className="mt-1 leading-5">{notification.mensaje}</div>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}