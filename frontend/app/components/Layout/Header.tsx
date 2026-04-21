"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";
import HeaderLinks from "./HeaderLinks";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-acero bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-azul-pro text-white">
            <Dumbbell size={18} />
          </span>
          <span className="font-titles text-lg uppercase">Complejo Deportivo</span>
        </Link>
        <HeaderLinks />
      </div>
    </header>
  );
}
