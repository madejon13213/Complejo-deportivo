import SpaceCard from "@/app/components/Cards/SpaceCard";
import { SpaceType } from "@/lib/types";

const spaces: SpaceType[] = [
  { id: 1, nombre: "Pádel", descripcion: "Pistas de pádel indoor y outdoor" },
  { id: 2, nombre: "Piscina", descripcion: "Piscina olímpica y recreativa" },
  { id: 3, nombre: "Gimnasio", descripcion: "Sala de musculación y cardio" },
];

export default function SpacesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Tipos de espacios</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {spaces.map((space) => (
          <SpaceCard key={space.id} space={space} />
        ))}
      </div>
    </div>
  );
}
