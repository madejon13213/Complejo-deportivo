"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Input from "@/app/components/UI/Input";
import Button from "@/app/components/UI/Button";
import Spinner from "@/app/components/UI/Spinner";
import Toast from "@/app/components/UI/Toast";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

interface LoginResponse {
  success: boolean;
  id: number;
  name: string;
  email: string;
  rol: string;
}

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<LoginResponse>("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(response);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Toast kind="error" message={error} />}
      <Input label="Email" type="email" icon={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input
        label="Contraseña"
        type="password"
        icon={<Lock size={16} />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button className="w-full" type="submit" icon={loading ? <Spinner /> : <ArrowRight size={16} />}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
