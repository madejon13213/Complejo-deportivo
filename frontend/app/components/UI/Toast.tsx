"use client";

import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

interface ToastProps {
  kind?: "success" | "error" | "warning" | "info";
  message: string;
}

const iconMap = {
  success: <CheckCircle2 size={16} />,
  error: <XCircle size={16} />,
  warning: <AlertCircle size={16} />,
  info: <Info size={16} />,
};

const styleMap = {
  success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  error: "border-red-400/30 bg-red-500/10 text-red-200",
  warning: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  info: "border-blue-400/30 bg-blue-500/10 text-blue-200",
};

export default function Toast({ kind = "info", message }: ToastProps) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm ${styleMap[kind]}`}>
      {iconMap[kind]}
      <span>{message}</span>
    </div>
  );
}
