"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, UserPlus } from "lucide-react";
import LoginForm from "@/app/components/Forms/LoginForm";
import RegisterForm from "@/app/components/Forms/RegisterForm";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">("login");

  useEffect(() => {
    const queryTab = searchParams.get("tab");
    if (queryTab === "register") setTab("register");
    if (queryTab === "login") setTab("login");
  }, [searchParams]);

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-carbon px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-nieve p-6 shadow-2xl">
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-acero p-1">
          <button
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === "login" ? "bg-white text-carbon" : "text-gray-600"}`}
            onClick={() => setTab("login")}
          >
            Iniciar sesión
          </button>
          <button
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === "register" ? "bg-white text-carbon" : "text-gray-600"}`}
            onClick={() => setTab("register")}
          >
            Registrarse
          </button>
        </div>

        {tab === "login" ? (
          <div className="space-y-4">
            <h1 className="text-3xl">Accede a tu cuenta</h1>
            <LoginForm />
            <button className="text-sm text-azul-pro" onClick={() => setTab("register")}>
              ¿Sin cuenta? Crear una <ArrowRight className="ml-1 inline" size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-3xl">Crea tu cuenta</h1>
            <RegisterForm />
            <button className="text-sm text-azul-pro" onClick={() => setTab("login")}>
              ¿Ya tienes cuenta? Entrar <UserPlus className="ml-1 inline" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
