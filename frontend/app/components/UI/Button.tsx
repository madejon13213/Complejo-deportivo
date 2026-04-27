import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  icon?: ReactNode;
}

const styles = {
  primary:
    "border border-[#ff9a5a] bg-gradient-to-r from-[#e8863a] to-[#ef9f5a] text-white hover:brightness-110 disabled:opacity-60",
  secondary:
    "border border-white/25 bg-white/10 text-white hover:bg-white/20 disabled:opacity-60",
  danger:
    "border border-red-400/40 bg-red-500/80 text-white hover:bg-red-500 disabled:opacity-60",
};

export default function Button({ variant = "primary", icon, className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${styles[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
