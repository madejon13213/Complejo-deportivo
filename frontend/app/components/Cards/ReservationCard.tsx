import { Calendar, Clock, MapPin } from "lucide-react";

import Badge from "@/app/components/UI/Badge";
import { Reservation } from "@/lib/types";

interface ReservationCardProps {
  reservation: Reservation;
}

export default function ReservationCard({ reservation }: ReservationCardProps) {
  const normalized = reservation.estado.toLowerCase();
  const tone = normalized === "confirmada" ? "success" : normalized === "cancelada" ? "error" : "neutral";

  return (
    <article className="rounded-2xl border border-white/15 bg-black/35 p-4 text-white backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg text-white">Reserva #{reservation.id}</h3>
        <Badge tone={tone}>{reservation.estado || "pendiente"}</Badge>
      </div>
      <div className="space-y-2 text-sm text-gray-200">
        <p className="inline-flex items-center gap-2">
          <MapPin size={14} /> Espacio #{reservation.id_espacio}
        </p>
        <p className="inline-flex items-center gap-2">
          <Calendar size={14} /> {reservation.fecha}
        </p>
        <p className="inline-flex items-center gap-2">
          <Clock size={14} /> {reservation.hora_inicio} - {reservation.hora_fin}
        </p>
        <p className="text-sm font-semibold text-[#ffcc9f]">Total: {Number(reservation.precio_total || 0).toFixed(2)} €</p>
      </div>
    </article>
  );
}
