import { AlertTriangle } from "lucide-react";

import { Penalty } from "@/lib/types";

interface PenaltiesTableProps {
  rows: Penalty[];
}

export default function PenaltiesTable({ rows }: PenaltiesTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black/35 backdrop-blur-sm">
      <table className="min-w-full text-sm text-gray-100">
        <thead className="border-b border-white/15 bg-black/35 text-left">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">ID reserva</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Desde</th>
            <th className="px-4 py-3">Hasta</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10">
              <td className="px-4 py-3 text-gray-100">{row.id}</td>
              <td className="px-4 py-3 text-gray-100">{row.id_reserva}</td>
              <td className="px-4 py-3 text-gray-100">
                <span className="inline-flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-300" />
                  {row.tipo_penalizacion}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-200">{row.fecha_inicio}</td>
              <td className="px-4 py-3 text-gray-200">{row.fecha_fin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
