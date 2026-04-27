"use client";

import PenalizationForm from "@/app/components/Modals/PenalizationForm";
import DataTable from "@/app/components/Tables/DataTable";
import Toast from "@/app/components/UI/Toast";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getAllPenalties } from "@/lib/services/penalties";
import { Penalty } from "@/lib/types";

export default function AdminPenalizacionesPage() {
  const penaltiesQuery = useApiQuery<Penalty[]>(() => getAllPenalties(), []);

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (row: Penalty) => row.id,
      searchable: (row: Penalty) => String(row.id),
    },
    {
      key: "reserva",
      header: "ID reserva",
      render: (row: Penalty) => row.id_reserva,
      searchable: (row: Penalty) => String(row.id_reserva),
    },
    {
      key: "tipo",
      header: "Motivo",
      render: (row: Penalty) => row.tipo_penalizacion,
      searchable: (row: Penalty) => row.tipo_penalizacion,
    },
    {
      key: "rango",
      header: "Fecha",
      render: (row: Penalty) => row.fecha_inicio,
      searchable: (row: Penalty) => `${row.fecha_inicio} ${row.fecha_fin}`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-medium tracking-tight">Admin · Penalizaciones</h1>
        <PenalizationForm onSuccess={penaltiesQuery.refetch} />
      </div>
      {penaltiesQuery.error && <Toast kind="error" message={penaltiesQuery.error} />}
      <DataTable rows={penaltiesQuery.data || []} columns={columns} emptyMessage="No hay penalizaciones registradas." />
    </div>
  );
}
