import { ReactNode } from "react";
import Link from "next/link";
import { Zap, Calendar, MapPin, Trophy, Users, ArrowRight, ShieldCheck, Activity } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Luces de fondo (Glow effects) */}
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-azul-pro/15 blur-[120px]"></div>
      <div className="absolute top-[40%] right-0 -z-10 h-[400px] w-[400px] rounded-full bg-lima-neon/10 blur-[120px]"></div>

      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-20 text-nieve md:pt-32 md:pb-24">
        <div className="mx-auto max-w-5xl text-center">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-lima-neon/30 bg-lima-neon/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-lima-neon shadow-[0_0_15px_rgba(232,134,58,0.2)]">
              <Zap size={14} className="animate-pulse" /> El Futuro del Deporte
            </span>
          </div>
          
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">
            Reserva. Entrena. <br className="hidden sm:block"/>
            <span className="bg-gradient-to-r from-azul-pro via-indigo-400 to-lima-neon bg-clip-text text-transparent">
              Compite.
            </span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl font-body text-lg font-light leading-relaxed text-gray-300 md:text-xl">
            Un ecosistema digital premium para tu rendimiento. Gestiona tus reservas, conecta con la comunidad y eleva tu nivel en el Complejo Deportivo definitivo.
          </p>
          
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link 
              href="/login" 
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-azul-pro px-8 py-4 font-semibold text-white shadow-[0_0_25px_rgba(92,123,255,0.3)] transition-all hover:scale-105 hover:bg-indigo-500 hover:shadow-[0_0_35px_rgba(92,123,255,0.5)] sm:w-auto"
            >
              Comenzar ahora
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/courts" 
              className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 sm:w-auto"
            >
              Ver instalaciones
            </Link>
          </div>
        </div>
      </section>

      {/* Grid de Características */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Todo lo que necesitas</h2>
          <p className="mt-4 text-gray-400">Diseñado para ofrecer una experiencia impecable e intuitiva.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={<Calendar size={24} />} 
            title="Reservas en tiempo real" 
            text="Disponibilidad sincronizada al instante. Bloquea tu pista favorita con un par de clics y sin esperas." 
          />
          <FeatureCard 
            icon={<ShieldCheck size={24} />} 
            title="Gestión Segura" 
            text="Tus datos y transacciones están protegidos con los más altos estándares de seguridad." 
          />
          <FeatureCard 
            icon={<Activity size={24} />} 
            title="Control de Rendimiento" 
            text="Sigue tu historial de reservas y analiza tu constancia deportiva mes a mes en tu panel." 
          />
          <FeatureCard 
            icon={<MapPin size={24} />} 
            title="Múltiples Espacios" 
            text="Desde pistas de pádel hasta gimnasios de alto rendimiento, gestiona todo en un mismo lugar." 
          />
          <FeatureCard 
            icon={<Users size={24} />} 
            title="Comunidad Activa" 
            text="Forma parte de un club dinámico. Conecta con otros jugadores y organiza partidos con tu equipo." 
          />
          <FeatureCard 
            icon={<Trophy size={24} />} 
            title="Compite y Gana" 
            text="Inscríbete a los eventos del club y compite para llegar a lo más alto del ranking deportivo." 
          />
        </div>
      </section>

      {/* CTA Final */}
      <section className="mx-auto max-w-5xl px-4 py-24">
        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-black/60 to-acero/60 p-10 text-center backdrop-blur-md md:p-16">
          <div className="absolute -top-24 -right-24 -z-10 h-64 w-64 rounded-full bg-lima-neon/20 blur-[80px]"></div>
          <div className="absolute -bottom-24 -left-24 -z-10 h-64 w-64 rounded-full bg-azul-pro/20 blur-[80px]"></div>
          
          <h2 className="text-3xl font-bold md:text-5xl">¿Listo para jugar?</h2>
          <p className="mx-auto mt-6 max-w-xl text-gray-300">
            Únete hoy mismo a nuestra plataforma y descubre la forma más eficiente de gestionar tu pasión por el deporte.
          </p>
          <div className="mt-10">
            <Link 
              href="/register" 
              className="inline-block rounded-2xl bg-white px-8 py-4 font-bold text-black shadow-lg transition-transform hover:scale-105"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-white/5 p-8 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/15 hover:bg-white/10 hover:shadow-[0_10px_40px_-15px_rgba(92,123,255,0.2)]">
      <div className="absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full bg-azul-pro/10 blur-[40px] transition-all group-hover:bg-azul-pro/30"></div>
      
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/40 text-azul-pro shadow-inner border border-white/5 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-3 text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="font-body text-gray-400 leading-relaxed">{text}</p>
    </div>
  );
}
