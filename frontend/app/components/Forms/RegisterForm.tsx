"use client";

import { FormEvent, useState } from "react";
import { Mail, Phone, User, UserPlus } from "lucide-react";

import Button from "@/app/components/UI/Button";
import Input from "@/app/components/UI/Input";
import Toast from "@/app/components/UI/Toast";
import { apiFetch } from "@/lib/api";

interface RegisterPayload {
  nombre: string;
  pri_ape: string;
  seg_ape: string;
  email: string;
  password: string;
  repeat_password: string;
  telefono: string;
  rol: string;
}

export default function RegisterForm() {
  const [form, setForm] = useState<RegisterPayload>({
    nombre: "",
    pri_ape: "",
    seg_ape: "",
    email: "",
    password: "",
    repeat_password: "",
    telefono: "",
    rol: "CLIENTE",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (key: keyof RegisterPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.repeat_password) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await apiFetch("/users/register", { method: "POST", body: JSON.stringify(form) });
      setSuccess("Cuenta creada. Ya puedes iniciar sesión.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Toast kind="error" message={error} />}
      {success && <Toast kind="success" message={success} />}
      <Input label="Nombre" icon={<User size={16} />} value={form.nombre} onChange={(e) => update("nombre", e.target.value)} required />
      <Input label="Primer apellido" value={form.pri_ape} onChange={(e) => update("pri_ape", e.target.value)} required />
      <Input label="Segundo apellido" value={form.seg_ape} onChange={(e) => update("seg_ape", e.target.value)} />
      <Input label="Email" type="email" icon={<Mail size={16} />} value={form.email} onChange={(e) => update("email", e.target.value)} required />
      <Input label="Contraseña" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
      <Input label="Repetir contraseña" type="password" value={form.repeat_password} onChange={(e) => update("repeat_password", e.target.value)} required />
      <Input label="Teléfono" icon={<Phone size={16} />} value={form.telefono} onChange={(e) => update("telefono", e.target.value)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
        Aceptar términos
      </label>
      <Button className="w-full" type="submit" icon={<UserPlus size={16} />}>
        Crear cuenta
      </Button>
    </form>
  );
}
