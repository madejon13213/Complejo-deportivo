import { ReactNode } from "react";
import Link from "next/link";
import { Zap, Calendar, MapPin, Trophy, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="w-full">
      <section className="bg-carbon px-4 py-20 text-nieve">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-azul-pro/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-lima-neon">
            <Zap size={14} /> Plataforma deportiva
          </p>
          <h1 className="text-5xl">Reserva. Entrena. Compite.</h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-gray-300">
            Complejo Deportivo une reservas inteligentes, comunidad y rendimiento en una sola experiencia.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/auth" className="rounded-xl bg-azul-pro px-6 py-3 font-semibold text-white">Entrar</Link>
            <Link href="/courts" className="rounded-xl border border-white/30 px-6 py-3 font-semibold">Ver pistas</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 md:grid-cols-2 lg:grid-cols-5">
        <Feature icon={<Zap size={18} />} title="Velocidad" text="Reserva en segundos" />
        <Feature icon={<Calendar size={18} />} title="Calendario" text="Agenda siempre sincronizada" />
        <Feature icon={<MapPin size={18} />} title="Ubicación" text="Encuentra tu pista ideal" />
        <Feature icon={<Trophy size={18} />} title="Competencia" text="Sigue tu progreso" />
        <Feature icon={<Users size={18} />} title="Comunidad" text="Juega con más personas" />
      </section>

      <section className="border-t border-acero bg-white px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl">Testimonios</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Testimonial name="Lucía G." text="La reserva es rapidísima y clara." />
            <Testimonial name="Javier M." text="El dashboard me ayuda a organizar la semana." />
            <Testimonial name="Sara P." text="Diseño limpio y flujo muy cómodo en móvil." />
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-acero bg-white p-5 shadow-sm">
      <div className="mb-2 inline-flex rounded-lg bg-nieve p-2 text-azul-pro">{icon}</div>
      <h3 className="text-lg">{title}</h3>
      <p className="text-sm text-gray-600">{text}</p>
    </article>
  );
}

function Testimonial({ name, text }: { name: string; text: string }) {
  return (
    <article className="rounded-2xl border border-acero bg-nieve p-5">
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-azul-pro text-white">
        {name.charAt(0)}
      </div>
      <p className="text-sm text-gray-700">{text}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{name}</p>
    </article>
  );
}
