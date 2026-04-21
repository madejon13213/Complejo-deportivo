"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl">Algo salió mal</h1>
      <p className="mt-2 text-gray-600">Ha ocurrido un error inesperado.</p>
      <div className="mt-6 flex gap-2">
        <button onClick={reset} className="rounded-xl bg-azul-pro px-4 py-2 text-sm font-semibold text-white">
          Reintentar
        </button>
        <Link href="/" className="rounded-xl border border-acero px-4 py-2 text-sm font-semibold">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
