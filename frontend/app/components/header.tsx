"use client";

import Link from "next/link";
import HeaderLinks from "./headerlinks";
import { Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-acero bg-white/80 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* 1. Logo/Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-carbon hover:text-azul-pro transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-xl bg-azul-pro flex items-center justify-center shadow-lg shadow-azul-pro/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-titles text-xl tracking-tighter uppercase font-black">
                TFG<span className="text-azul-pro">SPORT</span>
              </span>
              <span className="text-[10px] font-body font-bold text-gray-400 tracking-[0.2em] uppercase">
                Complejo
              </span>
            </div>
          </Link>
        </div>

        {/* 2. Navegación y Botones de Auth (Todo en uno) */}
        {/* He quitado los botones manuales de aquí para que no se dupliquen con HeaderLinks */}
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center">
            <HeaderLinks />
          </nav>

          {/* Botón Hamburger Mobile (Solo visible en móviles) */}
          <div className="md:hidden flex items-center">
            <button className="p-2 rounded-lg text-carbon hover:bg-acero transition-colors border border-transparent active:border-acero">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-16 6h16" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}