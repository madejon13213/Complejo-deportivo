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
    <header className="sticky top-0 z-40 border-b border-acero bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="inline-flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-azul-pro text-white">
            <Dumbbell size={18} />
          </span>
          <span className="font-titles text-lg uppercase">Complejo Deportivo</span>
        </Link>

        <div className="hidden md:block">
          <HeaderLinks />
        </div>

        <button className="rounded-lg border border-acero p-2 md:hidden" onClick={() => setOpen((prev) => !prev)}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-acero bg-white px-4 py-3 md:hidden">
          <nav className="space-y-2">
            {mobileLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-nieve"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/auth" onClick={() => setOpen(false)} className="block rounded-lg bg-azul-pro px-3 py-2 text-sm font-semibold text-white">
              Acceder
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
