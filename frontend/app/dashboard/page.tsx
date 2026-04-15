import { 
  Activity, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  MapPin 
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* Header del Dashboard */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-azul-pro font-titles text-sm tracking-widest uppercase">Panel de Control</p>
          <h1 className="text-4xl md:text-5xl">Bienvenido, Admin</h1>
        </div>
        <div className="flex items-center gap-2 bg-acero/50 px-4 py-2 rounded-lg text-sm font-medium">
          <Calendar className="w-4 h-4 text-azul-pro" />
          <span>Lunes, 6 de Abril de 2026</span>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Reservas Hoy" value="42" icon={<Calendar />} trend="+12%" />
        <StatCard title="Usuarios Activos" value="1,284" icon={<Users />} trend="+5%" />
        <StatCard title="Ocupación" value="85%" icon={<Activity />} trend="+2%" />
        <StatCard title="Ingresos (Mes)" value="€12.4k" icon={<TrendingUp />} trend="+18%" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Pistas (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl flex items-center gap-2">
            <MapPin className="text-azul-pro" /> Estado de las Pistas
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CourtCard name="Pista de Pádel A" status="Ocupada" time="18:00 - 19:30" type="Pádel" />
            <CourtCard name="Pista de Pádel B" status="Libre" time="Disponible" type="Pádel" />
            <CourtCard name="Cancha Central" status="Mantenimiento" time="Hasta mañana" type="Basket" />
            <CourtCard name="Piscina Olímpica" status="Ocupada" time="09:00 - 21:00" type="Natación" />
          </div>
        </div>

        {/* Actividad Reciente (Sidebar Content) */}
        <aside className="space-y-6">
          <h2 className="text-2xl flex items-center gap-2">
            <Clock className="text-azul-pro" /> Actividad
          </h2>
          <div className="bg-white border border-acero rounded-2xl p-6 shadow-sm space-y-6">
            <ActivityItem user="Juan Pérez" action="Reservó Pista A" time="Hace 5 min" />
            <ActivityItem user="María G." action="Canceló Clase Yoga" time="Hace 12 min" />
            <ActivityItem user="Carlos R." action="Nuevo registro" time="Hace 45 min" />
            <button className="w-full py-3 text-sm font-titles border-2 border-azul-pro text-azul-pro rounded-xl hover:bg-azul-pro hover:text-white transition-all uppercase tracking-tighter">
              Ver todo el historial
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// --- Subcomponentes para mantener el código limpio ---

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-acero shadow-sm hover:border-azul-pro transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-nieve rounded-lg text-azul-pro group-hover:bg-azul-pro group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">{trend}</span>
      </div>
      <p className="text-gray-500 text-sm font-body">{title}</p>
      <h3 className="text-3xl m-0">{value}</h3>
    </div>
  );
}

function CourtCard({ name, status, time, type }: { name: string, status: 'Libre' | 'Ocupada' | 'Mantenimiento', time: string, type: string }) {
  const statusColors = {
    Libre: "bg-lima-neon text-carbon",
    Ocupada: "bg-carbon text-white",
    Mantenimiento: "bg-red-100 text-red-600"
  };

  return (
    <div className="bg-white border border-acero p-5 rounded-xl flex flex-col justify-between h-40 group hover:shadow-md transition-shadow">
      <div>
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase tracking-widest text-azul-pro font-bold">{type}</span>
          <span className={`text-[10px] px-2 py-1 rounded font-black uppercase ${statusColors[status]}`}>
            {status}
          </span>
        </div>
        <h4 className="text-lg mt-1">{name}</h4>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 font-body">
        <Clock className="w-4 h-4" />
        {time}
      </div>
    </div>
  );
}

function ActivityItem({ user, action, time }: { user: string, action: string, time: string }) {
  return (
    <div className="flex justify-between items-center border-b border-acero pb-4 last:border-0 last:pb-0 font-body">
      <div>
        <p className="font-bold text-sm">{user}</p>
        <p className="text-xs text-gray-500">{action}</p>
      </div>
      <span className="text-[10px] text-gray-400">{time}</span>
    </div>
  );
}