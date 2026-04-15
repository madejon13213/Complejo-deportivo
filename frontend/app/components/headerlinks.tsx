"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, User, LogIn, UserPlus, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function HeaderLinks() {
  const pathname = usePathname();
  const { isAuthenticated, logout, isReady } = useAuth();

  // Esqueleto de carga o nav vacío mientras se verifica la sesión
  if (!isReady) return <nav className="hidden md:flex items-center gap-8"></nav>;

  // Definición de links basada en autenticación
  const navItems = isAuthenticated ? [
    { label: "Inicio", path: "/", icon: <Home className="w-4 h-4" /> },
    { label: "Panel", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Perfil", path: "/perfil", icon: <User className="w-4 h-4" /> },
  ] : [
    { label: "Inicio", path: "/", icon: <Home className="w-4 h-4" /> },
    { label: "Instalaciones", path: "/#instalaciones", icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <nav className="hidden md:flex items-center gap-8">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`flex items-center gap-2 text-sm font-titles uppercase tracking-tight transition-all hover:text-azul-pro ${
            pathname === item.path 
              ? "text-azul-pro font-black border-b-2 border-azul-pro pb-1" 
              : "text-carbon/70 font-bold"
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
      
      {isAuthenticated ? (
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-titles uppercase tracking-tight font-bold text-red-500 hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      ) : (
        <div className="flex items-center gap-4 border-l border-acero pl-8">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-titles uppercase tracking-tight font-bold text-carbon hover:text-azul-pro transition-colors"
          >
            <LogIn className="w-4 h-4 text-azul-pro" />
            Entrar
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 text-sm font-titles uppercase tracking-tight font-black bg-azul-pro text-nieve px-5 py-2.5 rounded-xl hover:bg-carbon hover:shadow-lg transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Registro
          </Link>
        </div>
      )}
    </nav>
  );
}