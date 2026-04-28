"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Dumbbell, Menu, X } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import HeaderLinks from "./HeaderLinks";

const mobileLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reservations/my", label: "Mis reservas" },
  { href: "/courts", label: "Pistas" },
  { href: "/profile", label: "Perfil" },
];

function formatNotificationType(type: string) {
  return type.replaceAll("_", " ");
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { isAuthenticated, notifications, unreadNotificationsCount, markNotificationAsRead } = useAuth();

  const badgeText = useMemo(() => {
    if (unreadNotificationsCount <= 0) return "";
    return unreadNotificationsCount > 9 ? "+9" : String(unreadNotificationsCount);
  }, [unreadNotificationsCount]);

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto max-w-7xl rounded-full border border-white/10 bg-black/35 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" className="inline-flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
              <Dumbbell size={16} />
            </span>
            <span className="font-titles text-2xl">Complejo Deportivo</span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <HeaderLinks />
            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  className="relative rounded-full border border-white/20 p-2 text-white hover:bg-white/10"
                  aria-label="Notificaciones"
                >
                  <Bell size={18} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                      {badgeText}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-96 rounded-2xl border border-white/15 bg-[#0c1221] p-2 shadow-2xl">
                    <div className="mb-1 px-2 py-1 text-sm font-semibold text-gray-200">Notificaciones</div>
                    <div className="max-h-80 space-y-2 overflow-auto p-1">
                      {notifications.length === 0 && (
                        <div className="rounded-xl bg-white/5 px-3 py-3 text-sm text-gray-300">No tienes notificaciones.</div>
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
                          className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                            notification.leida
                              ? "border-white/10 bg-white/5 text-gray-300"
                              : "border-blue-400/30 bg-blue-500/10 text-white"
                          }`}
                        >
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#9bb3ff]">
                            {formatNotificationType(notification.tipo)}
                          </div>
                          <div className="mt-1 text-sm leading-5">{notification.mensaje}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="rounded-full border border-white/20 p-2 text-white md:hidden" onClick={() => setOpen((prev) => !prev)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/10 bg-black/55 px-4 py-3 md:hidden">
            <nav className="space-y-2">
              {mobileLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/auth" onClick={() => setOpen(false)} className="block rounded-lg bg-[#e8863a] px-3 py-2 text-sm font-semibold text-white">
                Acceder
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}