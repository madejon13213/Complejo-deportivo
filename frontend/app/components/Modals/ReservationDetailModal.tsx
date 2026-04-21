"use client";

import { Reservation } from "@/lib/types";
import Button from "@/app/components/UI/Button";

interface ReservationDetailModalProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
}

export default function ReservationDetailModal({ open, onClose, reservation }: ReservationDetailModalProps) {
  if (!open || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-xl">Detalle de reserva</h3>
        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p>ID: {reservation.id}</p>
          <p>Fecha: {reservation.fecha}</p>
          <p>Horario: {reservation.hora_inicio} - {reservation.hora_fin}</p>
          <p>Estado: {reservation.estado}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
