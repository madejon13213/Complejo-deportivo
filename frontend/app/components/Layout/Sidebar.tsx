"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Calendar, Dumbbell, Users, User, AlertTriangle } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: <BarChart3 size={16} /> },
  { href: "/reservations/my", label: "Mis reservas", icon: <Calendar size={16} /> },
  { href: "/courts", label: "Pistas", icon: <Dumbbell size={16} /> },
  { href: "/spaces", label: "Espacios", icon: <Users size={16} /> },
  { href: "/profile", label: "Perfil", icon: <User size={16} /> },
  { href: "/penalties", label: "Penalizaciones", icon: <AlertTriangle size={16} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-acero bg-white p-4 md:block">
      <nav className="space-y-2">
        {links.map((item) => (
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
