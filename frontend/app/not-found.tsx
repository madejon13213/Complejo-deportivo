import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl">404</h1>
      <p className="mt-2 text-gray-600">No encontramos la página que buscabas.</p>
      <Link href="/" className="mt-6 rounded-xl bg-azul-pro px-4 py-2 text-sm font-semibold text-white">
        Volver al inicio
      </Link>
    </div>
  );
}
