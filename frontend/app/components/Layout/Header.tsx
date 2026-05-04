"use client";

import { useState } from "react";
import Link from "next/link";
import { Dumbbell, Menu, X } from "lucide-react";

import HeaderLinks from "./HeaderLinks";

const mobileLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reservations/my", label: "Mis reservas" },
  { href: "/courts", label: "Pistas" },
  { href: "/profile", label: "Perfil" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-7xl">
        {/* Barra principal tipo píldora */}
        <div className="rounded-full border border-white/10 bg-black/35 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-5">
            <Link href="/" className="inline-flex items-center gap-2" onClick={() => setOpen(false)}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
                <Dumbbell size={16} />
              </span>
              <span className="font-titles text-xl md:text-2xl">Complejo Deportivo</span>
            </Link>

            <div className="hidden md:block">
              <HeaderLinks />
            </div>

            <button
              className="rounded-full border border-white/20 p-2 text-white transition-colors hover:bg-white/10 md:hidden"
              onClick={() => setOpen((prev) => !prev)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {open && (
          <div className="mt-2 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-md md:hidden">
            <nav className="space-y-1 px-4 py-3">
              {mobileLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-white/10 pt-2">
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl bg-[#e8863a] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:brightness-110"
                >
                  Acceder
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
