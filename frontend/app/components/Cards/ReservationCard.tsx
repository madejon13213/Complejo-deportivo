import { Calendar, Clock, MapPin } from "lucide-react";
import { Reservation } from "@/lib/types";
import Badge from "@/app/components/UI/Badge";

interface ReservationCardProps {
  reservation: Reservation;
}

export default function ReservationCard({ reservation }: ReservationCardProps) {
  const tone =
    reservation.estado === "confirmada"
      ? "success"
      : reservation.estado === "cancelada"
      ? "error"
      : "neutral";

  return (
    <article className="rounded-2xl border border-acero bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg">Reserva #{reservation.id}</h3>
        <Badge tone={tone}>{reservation.estado ?? "pendiente"}</Badge>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p className="inline-flex items-center gap-2">
          <MapPin size={14} /> {reservation.courtName ?? "Pista"}
        </p>
        <p className="inline-flex items-center gap-2">
          <Calendar size={14} /> {reservation.fecha}
        </p>
        <p className="inline-flex items-center gap-2">
          <Clock size={14} /> {reservation.hora_inicio ?? "--"} - {reservation.hora_fin ?? "--"}
        </p>
      </div>
    </article>
  );
}
