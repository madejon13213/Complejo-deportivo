"use client";

import { Activity, Heart, Instagram, Twitter, Facebook } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-carbon text-nieve border-t border-white/10 mt-auto overflow-hidden font-body">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand & Slogan */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-azul-pro flex items-center justify-center shadow-lg shadow-azul-pro/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-titles font-black tracking-tighter uppercase">
                TFG<span className="text-azul-pro">SPORT</span>
              </h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              La plataforma definitiva para la gestión de complejos deportivos. 
              Optimiza tus reservas, controla tus instalaciones y potencia la 
              experiencia de tus socios.
            </p>
            {/* Redes Sociales */}
            <div className="flex gap-4 pt-2">
              <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-azul-pro transition-colors">
                <Instagram className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-azul-pro transition-colors">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-azul-pro transition-colors">
                <Facebook className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Navegación */}
          <div className="col-span-1">
            <h4 className="font-titles text-xs font-bold uppercase tracking-widest text-azul-pro mb-6">
              Plataforma
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-lima-neon transition-colors">Inicio</Link></li>
              <li><Link href="/dashboard" className="hover:text-lima-neon transition-colors">Dashboard</Link></li>
              <li><Link href="/reservas" className="hover:text-lima-neon transition-colors">Pistas y Horarios</Link></li>
              <li><Link href="/clases" className="hover:text-lima-neon transition-colors">Actividades</Link></li>
            </ul>
          </div>

          {/* Legal / Soporte */}
          <div className="col-span-1">
            <h4 className="font-titles text-xs font-bold uppercase tracking-widest text-azul-pro mb-6">
              Soporte
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-lima-neon transition-colors">Privacidad</Link></li>
              <li><Link href="#" className="hover:text-lima-neon transition-colors">Términos de Uso</Link></li>
              <li><Link href="#" className="hover:text-lima-neon transition-colors">Centro de Ayuda</Link></li>
              <li><Link href="#" className="hover:text-lima-neon transition-colors">Contacto</Link></li>
            </ul>
          </div>
        </div>

        {/* Cierre / Copyright */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 text-[10px] uppercase tracking-widest text-gray-500 font-titles">
          <p>
            &copy; {year} TFG SPORT. Desarrollado para Complejos Deportivos.
          </p>
          <p className="flex items-center gap-2 mt-4 md:mt-0">
            Fuerza y Rendimiento <Heart className="w-3 h-3 text-lima-neon animate-pulse" /> Comunidad TFG
          </p>
        </div>
      </div>
    </footer>
  );
}