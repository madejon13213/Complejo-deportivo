"use client";

import { InputHTMLAttributes, ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
}

export default function Input({ label, icon, error, type = "text", ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-gray-200">{label}</span>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input
          type={isPassword && showPassword ? "text" : type}
          className={`w-full rounded-2xl border border-white/20 bg-black/30 py-2 text-sm text-white placeholder:text-gray-500 ${icon ? "pl-10" : "pl-3"} pr-10 outline-none focus:border-[#6d82ff] focus:bg-black/40 ${props.className || ""}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}
