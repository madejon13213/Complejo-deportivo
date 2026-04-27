import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "error" | "info";
}

const tones = {
  neutral: "border border-white/20 bg-white/10 text-white",
  success: "border border-emerald-400/35 bg-emerald-500/20 text-emerald-100",
  warning: "border border-amber-400/35 bg-amber-500/20 text-amber-100",
  error: "border border-red-400/35 bg-red-500/20 text-red-100",
  info: "border border-blue-400/35 bg-blue-500/20 text-blue-100",
};

export default function Badge({ children, tone = "neutral" }: BadgeProps) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
