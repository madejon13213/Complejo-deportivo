"use client";

import { useState } from "react";
import Input from "@/app/components/UI/Input";
import Button from "@/app/components/UI/Button";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [password, setPassword] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl text-white">
        <h3 className="text-xl font-semibold">Cambiar contraseña</h3>
        <p className="mt-1 text-sm text-gray-400">Introduce tu nueva contraseña a continuación.</p>
        
        <div className="mt-6 space-y-4">
          <Input
            label="Nueva contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
            Cancelar
          </Button>
          <Button onClick={onClose} className="bg-[#5c7bff] hover:bg-[#4a6cf7] text-white">
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
