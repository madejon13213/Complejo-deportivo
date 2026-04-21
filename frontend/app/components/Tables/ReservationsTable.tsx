import { Edit, Eye, Trash2 } from "lucide-react";
import { Reservation } from "@/lib/types";
import Badge from "@/app/components/UI/Badge";

interface ReservationsTableProps {
  rows: Reservation[];
}

export default function ReservationsTable({ rows }: ReservationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-acero bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-nieve text-left">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Pista</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Usuario</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((reservation) => (
            <tr key={reservation.id} className="border-t border-acero">
              <td className="px-4 py-3">{reservation.id}</td>
              <td className="px-4 py-3">{reservation.courtName || "Pista"}</td>
              <td className="px-4 py-3">{reservation.fecha}</td>
              <td className="px-4 py-3">{reservation.userName || "Usuario"}</td>
              <td className="px-4 py-3">
                <Badge>{reservation.estado || "pendiente"}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye size={16} />
                  <Edit size={16} />
                  <Trash2 size={16} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
