import Link from "next/link";
import { Calendar, DollarSign, Star, Users } from "lucide-react";
import Breadcrumb from "@/app/components/UI/Breadcrumb";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourtDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-8">
      <Breadcrumb items={[{ label: "Pistas", href: "/courts" }, { label: `Detalle ${id}` }]} />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-acero bg-nieve p-8 text-center">Galería (mock)</div>
        <div className="space-y-3 rounded-2xl border border-acero bg-white p-6">
          <h1 className="text-3xl">Pista #{id}</h1>
          <p className="inline-flex items-center gap-2 text-sm"><DollarSign size={14} /> 24 €/hora</p>
          <p className="inline-flex items-center gap-2 text-sm"><Users size={14} /> Capacidad: 4</p>
          <p className="inline-flex items-center gap-2 text-sm"><Star size={14} /> Rating: 4.8</p>
          <p className="inline-flex items-center gap-2 text-sm"><Calendar size={14} /> Disponibilidad próximos 7 días</p>
          <Link href={`/reservations/create?courtId=${id}`} className="inline-block rounded-xl bg-azul-pro px-4 py-2 text-sm font-semibold text-white">
            Hacer reserva
          </Link>
        </div>
      </div>
    </div>
  );
}
