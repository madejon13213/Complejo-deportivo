"use client";

import { useState } from "react";
import { AlertTriangle, Calendar, Clock, LogOut, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/app/components/UI/Button";
import ChangePasswordModal from "@/app/components/Modals/ChangePasswordModal";

export default function ProfilePage() {
  const { logout, role } = useAuth();
  const [openPassword, setOpenPassword] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Mi perfil</h1>
      <section className="rounded-2xl border border-acero bg-white p-6">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-azul-pro text-white text-xl font-semibold">U</div>
        <div className="grid gap-3 md:grid-cols-2">
          <p><strong>Nombre:</strong> Usuario Demo</p>
          <p><strong>Email:</strong> demo@mail.com</p>
          <p><strong>Teléfono:</strong> 600000000</p>
          <p><strong>Rol:</strong> {role || "cliente"}</p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card icon={<Calendar size={16} />} label="Total reservas" value="24" />
        <Card icon={<Clock size={16} />} label="Reservas activas" value="3" />
        <Card icon={<AlertTriangle size={16} />} label="Penalizaciones" value="0" />
        <Card icon={<Trophy size={16} />} label="Puntuación" value="4.8" />
      </section>

      <section className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setOpenPassword(true)}>Cambiar contraseña</Button>
        <Button variant="secondary">Descargar datos</Button>
        <Button variant="danger">Eliminar cuenta</Button>
        <Button icon={<LogOut size={16} />} onClick={logout}>Cerrar sesión</Button>
      </section>

      <ChangePasswordModal open={openPassword} onClose={() => setOpenPassword(false)} />
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-acero bg-white p-4">
      <div className="mb-2 inline-flex rounded-lg bg-nieve p-2 text-azul-pro">{icon}</div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </article>
  );
}
