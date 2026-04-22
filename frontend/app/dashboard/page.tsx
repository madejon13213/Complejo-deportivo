"use client";

import Link from "next/link";
import { AlertTriangle, Calendar, Clock, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/app/components/Layout/Sidebar";
import StatCard from "@/app/components/Cards/StatCard";
import ReservationCard from "@/app/components/Cards/ReservationCard";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getReservationsByUser } from "@/lib/services/reservations";
import { Reservation } from "@/lib/types";

export default function DashboardPage() {
  const { role, userId, isAdmin } = useAuth();
  const numericUserId = userId ? Number(userId) : null;

  const reservationsQuery = useApiQuery<Reservation[]>(
    () => getReservationsByUser(numericUserId || 0),
    [numericUserId]
  );

  const reservations = reservationsQuery.data || [];
  const nextReservations = reservations
    .filter((reservation) => reservation.estado !== "cancelada")
    .sort((a, b) => `${a.fecha}${a.hora_inicio}`.localeCompare(`${b.fecha}${b.hora_inicio}`))
    .slice(0, 3);

  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <Sidebar />
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <header className="space-y-2">
          <h1 className="text-4xl">Hola, deportista</h1>
          <p className="text-sm text-gray-600">Panel principal ({role || "sin rol"})</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total reservas" value={String(reservations.length)} icon={<Calendar size={18} />} />
          <StatCard title="Proximas" value={String(nextReservations.length)} icon={<Clock size={18} />} />
          <StatCard title="Penalizaciones" value="--" icon={<AlertTriangle size={18} />} />
          <StatCard title="Favoritos" value="--" icon={<Star size={18} />} />
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/reservas" className="rounded-2xl border border-acero bg-white p-4 text-sm font-semibold">Hacer reserva</Link>
          <Link href="/reservations/my" className="rounded-2xl border border-acero bg-white p-4 text-sm font-semibold">Mis reservas</Link>
          <Link href="/courts" className="rounded-2xl border border-acero bg-white p-4 text-sm font-semibold">Pistas disponibles</Link>
          <Link href="/profile" className="rounded-2xl border border-acero bg-white p-4 text-sm font-semibold">Mi perfil</Link>
        </section>

        {isAdmin && (
          <Link href="/admin/usuarios" className="inline-block rounded-xl bg-azul-pro px-4 py-2 text-sm font-semibold text-white">
            Ir a gestion de usuarios
          </Link>
        )}

        {reservationsQuery.loading && <Spinner />}
        {reservationsQuery.error && <Toast kind="error" message={reservationsQuery.error} />}

        <section className="space-y-3">
          <h2 className="text-2xl">Proximas reservas</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {nextReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
            {!nextReservations.length && <p className="text-sm text-gray-600">No tienes reservas proximas.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
