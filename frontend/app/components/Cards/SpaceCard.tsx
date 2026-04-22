import Link from "next/link";
import { Dumbbell, Waves, Building2 } from "lucide-react";
import { SpaceType } from "@/lib/types";
import Button from "@/app/components/UI/Button";

interface SpaceCardProps {
  space: SpaceType;
}

function iconFor(name: string) {
  const value = name.toLowerCase();
  if (value.includes("pisc")) return <Waves size={18} />;
  if (value.includes("gim")) return <Dumbbell size={18} />;
  return <Building2 size={18} />;
}

export default function SpaceCard({ space }: SpaceCardProps) {
  return (
    <article className="rounded-2xl border border-acero bg-white p-5 shadow-sm">
      <div className="mb-3 inline-flex rounded-lg bg-nieve p-2 text-azul-pro">{iconFor(space.tipo)}</div>
      <h3 className="text-xl">{space.tipo}</h3>
      <p className="mb-4 mt-2 text-sm text-gray-600">
        {space.permite_reserva_parcial ? "Permite reserva parcial" : "Solo reserva completa"}
      </p>
      <Link href={`/courts?spaceType=${space.id}`}>
        <Button className="w-full" variant="secondary">
          Ver pistas
        </Button>
      </Link>
    </article>
  );
}
