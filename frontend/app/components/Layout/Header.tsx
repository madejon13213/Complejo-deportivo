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
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto max-w-7xl rounded-full border border-white/10 bg-black/35 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" className="inline-flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
              <Dumbbell size={16} />
            </span>
            <span className="font-titles text-2xl">Complejo Deportivo</span>
          </Link>

          <div className="hidden md:block">
            <HeaderLinks />
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