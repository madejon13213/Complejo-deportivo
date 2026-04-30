"use client";

import Link from "next/link";
import { AlertTriangle, Calendar, Clock } from "lucide-react";

import ReservationCard from "@/app/components/Cards/ReservationCard";
import StatCard from "@/app/components/Cards/StatCard";
import Sidebar from "@/app/components/Layout/Sidebar";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import { useAuth } from "@/context/AuthContext";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getPenaltiesByUser } from "@/lib/services/penalties";
import { getReservationsByUser } from "@/lib/services/reservations";
import { PenaltySearchResponse, ReservationSearchResponse } from "@/lib/types";

export default function DashboardPage() {
  const { role, userId, isAdmin, isReady } = useAuth();
  const numericUserId = userId ? Number(userId) : null;

  const reservationsQuery = useApiQuery<ReservationSearchResponse>(
    () => getReservationsByUser(numericUserId || 0, 1, 10),
    [numericUserId],
    { enabled: isReady && Boolean(numericUserId) }
  );

  const penaltiesQuery = useApiQuery<PenaltySearchResponse>(
    () => getPenaltiesByUser(numericUserId || 0, 1, 10),
    [numericUserId],
    { enabled: isReady && Boolean(numericUserId) }
  );

  const reservations = reservationsQuery.data?.items || [];
  const reservationsTotal = reservationsQuery.data?.total || 0;
  const penaltiesTotal = penaltiesQuery.data?.total || 0;

  const nextReservations = reservations
    .filter((reservation) => reservation.estado !== "Cancelada")
    .sort((a, b) => `${a.fecha}${a.hora_inicio}`.localeCompare(`${b.fecha}${b.hora_inicio}`))
    .slice(0, 3);

  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <Sidebar />
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <header className="space-y-2">
          <h1 className="text-4xl text-white">Hola, deportista</h1>
          <p className="text-sm text-gray-300">Panel principal ({role || "sin rol"})</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total reservas" value={String(reservationsTotal)} icon={<Calendar size={18} />} />
          <StatCard title="Proximas" value={String(nextReservations.length)} icon={<Clock size={18} />} />
          <StatCard
            title="Penalizaciones"
            value={penaltiesQuery.loading ? "..." : String(penaltiesTotal)}
            icon={<AlertTriangle size={18} />}
          />
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/reservas" className="rounded-2xl border border-white/15 bg-black/35 p-4 text-sm font-semibold text-white backdrop-blur-sm hover:bg-black/45">Hacer reserva</Link>
          <Link href="/reservations/my" className="rounded-2xl border border-white/15 bg-black/35 p-4 text-sm font-semibold text-white backdrop-blur-sm hover:bg-black/45">Mis reservas</Link>
          <Link href="/courts" className="rounded-2xl border border-white/15 bg-black/35 p-4 text-sm font-semibold text-white backdrop-blur-sm hover:bg-black/45">Pistas disponibles</Link>
          <Link href="/profile" className="rounded-2xl border border-white/15 bg-black/35 p-4 text-sm font-semibold text-white backdrop-blur-sm hover:bg-black/45">Mi perfil</Link>
        </section>

        {isAdmin && (
          <Link href="/admin/usuarios" className="inline-block rounded-full bg-[#5c7bff] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
            Ir a gestion de usuarios
          </Link>
        )}

        {reservationsQuery.loading && <Spinner />}
        {reservationsQuery.error && <Toast kind="error" message={reservationsQuery.error} />}
        {penaltiesQuery.error && <Toast kind="error" message={penaltiesQuery.error} />}

        <section className="space-y-3">
          <h2 className="text-2xl text-white">Proximas reservas</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {nextReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
            {!nextReservations.length && <p className="text-sm text-gray-300">No tienes reservas proximas.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
