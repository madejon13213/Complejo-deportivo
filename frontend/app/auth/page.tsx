"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-nieve px-4">
      <div className="max-w-md w-full text-center">
        {/* Icono de Alerta con pulso animado */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
          <div className="relative bg-white p-6 rounded-full shadow-xl border border-red-100">
            <ShieldAlert className="w-16 h-16 text-red-500" />
          </div>
        </div>

        {/* Mensaje de Error */}
        <h1 className="text-4xl font-titles font-black uppercase text-carbon mb-2 tracking-tighter">
          Acceso <span className="text-red-500">Restringido</span>
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-6 text-gray-400 font-body font-medium">
          <Lock className="w-4 h-4" />
          <span>Error 403 - Forbidden</span>
        </div>

        <p className="text-gray-600 font-body mb-10 leading-relaxed">
          Lo sentimos, pero **no tienes los permisos suficientes** para ver esta sección. 
          Si crees que esto es un error, contacta con el administrador del complejo.
        </p>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 bg-carbon text-nieve px-6 py-3 rounded-xl font-titles font-black uppercase text-sm hover:bg-azul-pro transition-all active:scale-95 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Panel
          </Link>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-white text-carbon border border-acero px-6 py-3 rounded-xl font-titles font-black uppercase text-sm hover:bg-acero transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Ir al Inicio
          </Link>
        </div>

        {/* Decoración inferior */}
        <div className="mt-12 pt-8 border-t border-acero/50">
          <p className="text-[10px] text-gray-400 font-titles uppercase tracking-[0.2em]">
            TFG<span className="text-azul-pro">SPORT</span> Security System
          </p>
        </div>
      </div>
    </div>
  );
}