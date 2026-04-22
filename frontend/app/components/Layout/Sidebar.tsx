"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Calendar, Dumbbell, Users, User, AlertTriangle, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

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
    <aside className="hidden w-64 shrink-0 border-r border-acero bg-white p-4 md:block">
      <nav className="space-y-2">
        {visibleLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              pathname.startsWith(item.href) ? "bg-azul-pro text-white" : "text-carbon hover:bg-nieve"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
