import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export default function Spinner({ size = 18, className = "" }: SpinnerProps) {
  return <Loader2 className={`animate-spin ${className}`} size={size} aria-hidden="true" />;
}
