import Link from "next/link";
import { DollarSign, Star, Users } from "lucide-react";
import { Court } from "@/lib/types";
import Button from "@/app/components/UI/Button";

interface CourtCardProps {
  court: Court;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CourtCard({ court, isAdmin, onEdit, onDelete }: CourtCardProps) {
  return (
    <article className="rounded-2xl border border-white/15 bg-black/35 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex h-32 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white">
        <span className="font-semibold">{court.nombre}</span>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl text-white">{court.nombre}</h3>
        <p className="inline-flex items-center gap-1 text-sm text-gray-300">
          <DollarSign size={14} /> {court.precio_hora ?? 0} €/h
        </p>
        <p className="inline-flex items-center gap-1 text-sm text-gray-300">
          <Users size={14} /> Capacidad: {court.capacidad ?? 0}
        </p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex gap-2">
          <Link href={`/courts/${court.id}`} className="flex-1">
            <Button className="w-full" variant="secondary">
              Ver detalle
            </Button>
          </Link>
          <Link href={`/reservas?courtId=${court.id}`} className="flex-1">
            <Button className="w-full">Reservar</Button>
          </Link>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={onEdit} variant="secondary" className="flex-1">
              Editar
            </Button>
            <Button onClick={onDelete} variant="danger" className="flex-1">
              Eliminar
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}