"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LogOut, Menu, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function HeaderLinks() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  const links = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard", icon: <BarChart3 size={16} /> },
        { href: "/profile", label: "Perfil", icon: <User size={16} /> },
      ]
    : [];

  return (
    <div className="flex items-center gap-3">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold ${
            pathname.startsWith(item.href) ? "bg-nieve text-azul-pro" : "text-carbon hover:bg-nieve"
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}

      {!isAuthenticated && (
        <Link href="/auth" className="rounded-xl bg-azul-pro px-4 py-2 text-sm font-semibold text-white">
          <span className="inline-flex items-center gap-1">
            <Menu size={16} />
            Acceder
          </span>
        </Link>
      )}

      {isAuthenticated && (
        <button
          onClick={logout}
          className="inline-flex items-center gap-1 rounded-xl border border-acero px-3 py-2 text-sm font-semibold text-carbon hover:bg-nieve"
        >
          <LogOut size={16} />
          Salir
        </button>
      )}
    </div>
  );
}
