import Link from "next/link";
import { DollarSign, Star, Users } from "lucide-react";
import { Court } from "@/lib/types";
import Button from "@/app/components/UI/Button";

interface CourtCardProps {
  court: Court;
}

export default function CourtCard({ court }: CourtCardProps) {
  return (
    <article className="rounded-2xl border border-acero bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-nieve text-azul-pro">
        <span className="font-semibold">{court.nombre}</span>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl">{court.nombre}</h3>
        <p className="inline-flex items-center gap-1 text-sm text-gray-600">
          <DollarSign size={14} /> {court.precio_hora ?? 0} €/h
        </p>
        <p className="inline-flex items-center gap-1 text-sm text-gray-600">
          <Users size={14} /> Capacidad: {court.capacidad ?? 0}
        </p>
        <p className="inline-flex items-center gap-1 text-sm text-gray-600">
          <Star size={14} /> {court.rating ?? 4.5}
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <Link href={`/courts/${court.id}`} className="flex-1">
          <Button className="w-full" variant="secondary">
            Ver detalle
          </Button>
        </Link>
        <Link href={`/reservas?courtId=${court.id}`} className="flex-1">
          <Button className="w-full">Reservar</Button>
        </Link>
      </div>
    </article>
  );
}
