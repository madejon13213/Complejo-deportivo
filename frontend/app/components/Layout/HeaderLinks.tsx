"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Calendar, LogOut, Menu, Shield, User } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function HeaderLinks() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const links = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard", icon: <BarChart3 size={16} /> },
        { href: "/reservas", label: "Reservas", icon: <Calendar size={16} /> },
        { href: "/profile", label: "Perfil", icon: <User size={16} /> },
        ...(isAdmin ? [{ href: "/admin/usuarios", label: "Admin", icon: <Shield size={16} /> }] : []),
      ]
    : [];

  return (
    <div className="flex items-center gap-2">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm ${
            pathname.startsWith(item.href)
              ? "bg-white/20 text-white"
              : "text-gray-200 hover:bg-white/10 hover:text-white"
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}

      {!isAuthenticated && (
        <Link href="/login" className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10">
          <span className="inline-flex items-center gap-1">
            <Menu size={16} />
            Acceder
          </span>
        </Link>
      )}

      {isAuthenticated && (
        <button
          onClick={logout}
          className="inline-flex items-center gap-1 rounded-full border border-white/20 px-4 py-2 text-sm text-gray-100 hover:bg-white/10"
        >
          <LogOut size={16} />
          Salir
        </button>
      )}
    </div>
  );
}
