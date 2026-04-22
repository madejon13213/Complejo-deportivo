"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, DollarSign, Star, Users } from "lucide-react";
import Breadcrumb from "@/app/components/UI/Breadcrumb";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getCourtById } from "@/lib/services/courts";
import { Court } from "@/lib/types";

export default function CourtDetailPage() {
  const params = useParams<{ id: string }>();
  const courtId = Number(params.id);

  const courtQuery = useApiQuery<Court>(() => getCourtById(courtId), [courtId], { enabled: Boolean(courtId) });

  if (courtQuery.loading) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <Spinner />
      </div>
    );
  }

  if (courtQuery.error || !courtQuery.data) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <Toast kind="error" message={courtQuery.error || "No se pudo cargar la pista."} />
      </div>
    );
  }

  const court = courtQuery.data;

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-8">
      <Breadcrumb items={[{ label: "Pistas", href: "/courts" }, { label: court.nombre }]} />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-acero bg-nieve p-8 text-center">Galeria de la pista</div>
        <div className="space-y-3 rounded-2xl border border-acero bg-white p-6">
          <h1 className="text-3xl">{court.nombre}</h1>
          <p className="inline-flex items-center gap-2 text-sm"><DollarSign size={14} /> {court.precio_hora ?? 0} €/hora</p>
          <p className="inline-flex items-center gap-2 text-sm"><Users size={14} /> Capacidad: {court.capacidad ?? 0}</p>
          <p className="inline-flex items-center gap-2 text-sm"><Star size={14} /> Rating: {court.rating ?? 4.5}</p>
          <p className="inline-flex items-center gap-2 text-sm"><Calendar size={14} /> Disponibilidad proximos 7 dias</p>
          <Link href={`/reservas?courtId=${court.id}`} className="inline-block rounded-xl bg-azul-pro px-4 py-2 text-sm font-semibold text-white">
            Hacer reserva
          </Link>
        </div>
      </div>
    </div>
  );
}
