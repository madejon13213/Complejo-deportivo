import PenaltiesTable from "@/app/components/Tables/PenaltiesTable";
import { Penalty } from "@/lib/types";

const penalties: Penalty[] = [
  { id: 1, motivo: "No asistencia", estado: "cerrada", fecha: "2026-02-11" },
  { id: 2, motivo: "Cancelación tardía", estado: "activa", fecha: "2026-03-20" },
];

export default function PenaltiesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Mis penalizaciones</h1>
      <PenaltiesTable rows={penalties} />
    </div>
  );
}
