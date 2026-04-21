"use client";

import Link from "next/link";
import { AlertTriangle, Calendar, Clock, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/app/components/Layout/Sidebar";
import StatCard from "@/app/components/Cards/StatCard";
import ReservationCard from "@/app/components/Cards/ReservationCard";
import { Reservation } from "@/lib/types";

const mockReservations: Reservation[] = [
  { id: 1, fecha: "2026-04-24", hora_inicio: "18:00", hora_fin: "19:00", estado: "confirmada", courtName: "Pista 1" },
  { id: 2, fecha: "2026-04-25", hora_inicio: "19:00", hora_fin: "20:00", estado: "confirmada", courtName: "Pista 2" },
  { id: 3, fecha: "2026-04-27", hora_inicio: "17:00", hora_fin: "18:00", estado: "pendiente", courtName: "Pista 3" },
];

export default function DashboardPage() {
  const { role } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <Sidebar />
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <header className="space-y-2">
          <h1 className="text-4xl">Hola, deportista</h1>
          <p className="text-sm text-gray-600">Tu panel principal de actividad</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total reservas" value="24" icon={<Calendar size={18} />} />
          <StatCard title="Próximas" value="3" icon={<Clock size={18} />} />
          <StatCard title="Penalizaciones" value="0" icon={<AlertTriangle size={18} />} />
          <StatCard title="Favoritos" value="5" icon={<Star size={18} />} />
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/reservations/create" className="rounded-2xl border border-acero bg-white p-4 text-sm font-semibold">Hacer reserva</Link>
          <Link href="/reservations/my" className="rounded-2xl border border-acero bg-white p-4 text-sm font-semibold">Mis reservas</Link>
          <Link href="/courts" className="rounded-2xl border border-acero bg-white p-4 text-sm font-semibold">Pistas disponibles</Link>
          <Link href="/profile" className="rounded-2xl border border-acero bg-white p-4 text-sm font-semibold">Mi perfil</Link>
        </section>

        {role === "administrador" && (
          <Link href="/getAllUsers" className="inline-block rounded-xl bg-azul-pro px-4 py-2 text-sm font-semibold text-white">
            Ir a gestión de usuarios
          </Link>
        )}

        <section className="space-y-3">
          <h2 className="text-2xl">Próximas reservas</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {mockReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
