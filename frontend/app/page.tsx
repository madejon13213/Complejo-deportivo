import Link from "next/link";
import { Zap, CalendarCheck, Award, MapPin, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO SECTION - Impacto Visual */}
      <section className="relative bg-carbon text-nieve py-24 md:py-32 px-6 overflow-hidden">
        {/* Decoración de fondo (opcional, simula movimiento) */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="polka" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle fill="#eee" cx="25" cy="25" r="3"></circle>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#polka)"></rect>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center z-10">
          <div className="flex items-center gap-2 bg-azul-pro/20 text-azul-pro px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-azul-pro/30">
            <Zap className="w-4 h-4" />
            <span>El nuevo estándar deportivo</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl leading-none mb-6 tracking-tighter">
            ENTRENA. <br />
            <span className="text-lima-neon">RESERVA.</span> <br />
            GANA.
          </h1>
          
          <p className="font-body text-lg md:text-xl text-gray-300 max-w-2xl mb-12 leading-relaxed">
            Bienvenido a <span className="font-bold text-nieve">TFG Complejo Deportivo</span>, la plataforma digital más avanzada para gestionar tus entrenamientos, reservar pistas y alcanzar tus metas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
            <Link href="/register" className="bg-azul-pro text-nieve font-titles px-12 py-4 rounded-xl text-lg hover:bg-white hover:text-carbon transition-all shadow-lg text-center uppercase tracking-tight">
              Únete al Club
            </Link>
            <Link href="/login" className="bg-transparent border-2 border-nieve/30 text-nieve font-titles px-12 py-4 rounded-xl text-lg hover:border-lima-neon hover:text-lima-neon transition-all text-center uppercase tracking-tight">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION - Beneficios */}
      <section className="py-20 px-6 bg-nieve">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-xl mx-auto">
            <p className="text-azul-pro font-titles text-sm tracking-widest uppercase mb-2">¿Por qué nosotros?</p>
            <h2 className="text-4xl md:text-5xl">Tu rendimiento, nuestra prioridad</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<CalendarCheck />} 
              title="Reservas Inteligentes" 
              description="Gestiona tus pistas de pádel, tenis o fútbol en segundos desde cualquier dispositivo."
            />
            <FeatureCard 
              icon={<Award />} 
              title="Instalaciones Premium" 
              description="Accede a equipamiento de última generación y pistas mantenidas profesionalmente."
            />
            <FeatureCard 
              icon={<Zap />} 
              title="Clases Dirigidas" 
              description="Inscríbete en Crossfit, Yoga o Natación con los mejores instructores certificados."
            />
          </div>
        </div>
      </section>

      {/* 3. MÍNIMO TOUR/DEPORTES SECTION */}
      <section className="py-20 px-6 bg-white border-y border-acero">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl leading-tight">Más que un gimnasio, <span className="text-azul-pro">un ecosistema</span>.</h2>
            <p className="font-body text-gray-600 text-lg leading-relaxed">
              Nuestras instalaciones están diseñadas para deportistas exigentes. Contamos con tecnología de vanguardia para trackear tu progreso y una comunidad vibrante.
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 font-body text-sm text-gray-800">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-lima-neon"/> 12 Pistas de Pádel</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-lima-neon"/> Zona Crossfit 500m²</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-lima-neon"/> Piscina Olímpica</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-lima-neon"/> Spa & Recuperación</div>
            </div>
          </div>
          <div className="bg-acero h-96 rounded-2xl flex items-center justify-center text-gray-500 font-body shadow-inner border border-acero">
            [ Espacio para Imagen de la Instalación ]
          </div>
        </div>
      </section>

      {/* 4. ÚLTIMO CTA SECTION */}
      <section className="py-24 px-6 bg-nieve text-center">
        <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl border border-acero shadow-xl space-y-8 hover:border-azul-pro transition-colors">
          <Star className="w-12 h-12 text-lima-neon mx-auto" />
          <h2 className="text-4xl">¿Listo para el siguiente nivel?</h2>
          <p className="font-body text-gray-600 text-lg">
            Regístrate ahora para acceder a los horarios completos, precios exclusivos y nuestro sistema de reservas en tiempo real.
          </p>
          <Link href="/register" className="inline-block bg-carbon text-nieve font-titles px-10 py-4 rounded-xl text-lg hover:bg-azul-pro transition-all uppercase tracking-tight">
            Crear cuenta gratuita
          </Link>
        </div>
      </section>
    </div>
  );
}

// Subcomponente FeatureCard para mantener globals.css limpio de clases repetidas
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-acero shadow-sm hover:shadow-lg transition-all space-y-4 hover:-translate-y-1 hover:border-azul-pro group">
      <div className="w-12 h-12 bg-nieve rounded-lg flex items-center justify-center text-azul-pro border border-acero group-hover:bg-azul-pro group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl m-0 text-carbon">{title}</h3>
      <p className="font-body text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}