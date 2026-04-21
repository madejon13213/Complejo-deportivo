import { AlertTriangle } from "lucide-react";
import { Penalty } from "@/lib/types";

interface PenaltiesTableProps {
  rows: Penalty[];
}

export default function PenaltiesTable({ rows }: PenaltiesTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-acero bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-nieve text-left">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Motivo</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-acero">
              <td className="px-4 py-3">{row.id}</td>
              <td className="px-4 py-3 inline-flex items-center gap-2">
                <AlertTriangle size={14} /> {row.motivo || "Sin motivo"}
              </td>
              <td className="px-4 py-3">{row.estado || "pendiente"}</td>
              <td className="px-4 py-3">{row.fecha || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
