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
    <div className="min-h-[calc(100vh-8rem)] px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-white/15 bg-black/35 p-6 text-white shadow-2xl backdrop-blur-sm">
        <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/15 bg-black/30 p-1">
          <button
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${tab === "login" ? "bg-[#5c7bff] text-white" : "text-gray-300 hover:bg-white/10"}`}
            onClick={() => setTab("login")}
          >
            Iniciar sesión
          </button>
          <button
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${tab === "register" ? "bg-[#5c7bff] text-white" : "text-gray-300 hover:bg-white/10"}`}
            onClick={() => setTab("register")}
          >
            Registrarse
          </button>
        </div>

        {tab === "login" ? (
          <div className="space-y-4">
            <h1 className="text-3xl text-white">Accede a tu cuenta</h1>
            <LoginForm />
            <button className="text-sm text-[#88a0ff] hover:text-[#a2b5ff]" onClick={() => setTab("register")}>
              ¿Sin cuenta? Crear una <ArrowRight className="ml-1 inline" size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-3xl text-white">Crea tu cuenta</h1>
            <RegisterForm />
            <button className="text-sm text-[#88a0ff] hover:text-[#a2b5ff]" onClick={() => setTab("login")}>
              ¿Ya tienes cuenta? Entrar <UserPlus className="ml-1 inline" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
