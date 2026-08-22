import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Link } from 'react-router-dom';
import { 
  Users, Car, ClipboardList, TrendingUp, AlertCircle, Wrench, 
  CheckCircle2, Clock, Calendar, Droplet, ShieldCheck, Plus, FileText, ChevronRight
} from 'lucide-react';
import { ordenesData, vehiculosData } from '../data/mockData';

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.rol || 'cliente';

  if (role === 'administrador') {
    return <AdminDashboard user={user} />;
  }

  if (role === 'mecanico') {
    return <MecanicoDashboard user={user} />;
  }

  return <ClienteDashboard user={user} />;
}

// -------------------------------------------------------------
// DASHBOARD ADMINISTRADOR (LIGHT MODE)
// -------------------------------------------------------------
function AdminDashboard({ user }) {
  const stats = [
    { label: 'Órdenes Hoy', value: '12', icon: ClipboardList, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Clientes Activos', value: '450', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Vehículos Atendidos', value: '890', icon: Car, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Ingresos del Mes', value: '$2.5M', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-brand-50 text-brand-700 border border-brand-200 text-xs px-2.5 py-1 rounded-full font-semibold uppercase">
              Administración
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Hola, {user?.nombre || 'Administrador'}</h1>
          <p className="text-slate-500 text-sm">Resumen ejecutivo y control operacional del lubricentro.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/ordenes/nueva"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-brand-600/20"
          >
            <Plus size={18} />
            Nueva Orden
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Órdenes de Trabajo Recientes</h2>
            <Link to="/ordenes" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {ordenesData.map((orden) => (
              <div key={orden.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-brand-600 text-sm">#{orden.id}</span>
                    <p className="font-medium text-slate-900 text-sm">{orden.cliente}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{orden.vehiculo} • {orden.tipo}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">${orden.total.toLocaleString('es-CL')}</p>
                  <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-semibold mt-1 border ${
                    orden.estado === 'Pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {orden.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Indicadores Clave (KPI)</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-slate-600">Ocupación de Bahías</span>
              <span className="font-bold text-emerald-600">92%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-slate-600">Tiempo Promedio Atención</span>
              <span className="font-bold text-slate-900">48 min</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-slate-600">Servicios de Aceite Hoy</span>
              <span className="font-bold text-slate-900">37</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-slate-600">Boletas por Cobrar</span>
              <span className="font-bold text-amber-600">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DASHBOARD MECÁNICO / TALLER (LIGHT MODE)
// -------------------------------------------------------------
function MecanicoDashboard({ user }) {
  const [tallerOrders, setTallerOrders] = useState([
    {
      id: 1001,
      patente: 'AB-1234',
      vehiculo: 'Toyota Corolla 2022',
      cliente: 'Ana Contreras',
      servicio: 'Cambio de aceite sintético Mobil 1 + Filtros',
      estado: 'En proceso',
      tiempoEst: '30 min',
      tiempoTranscurrido: '15 min',
      checkpoints: { aceite: true, filtro: true, fluidos: false, frenos: false }
    },
    {
      id: 1002,
      patente: 'CD-4567',
      vehiculo: 'Ford Ranger 2021',
      cliente: 'Diego Muñoz',
      servicio: 'Servicio completo: Aceite Semisintético Castrol + Fluidos + Pastillas',
      estado: 'En revisión',
      tiempoEst: '60 min',
      tiempoTranscurrido: '5 min',
      checkpoints: { aceite: false, filtro: false, fluidos: false, frenos: false }
    },
    {
      id: 1004,
      patente: 'JK-9988',
      vehiculo: 'Chevrolet Sail 2019',
      cliente: 'Carlos Tapia',
      servicio: 'Cambio de aceite mineral Shell Helix',
      estado: 'Listo',
      tiempoEst: '30 min',
      tiempoTranscurrido: '28 min',
      checkpoints: { aceite: true, filtro: true, fluidos: true, frenos: true }
    }
  ]);

  const toggleCheck = (orderId, key) => {
    setTallerOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          checkpoints: { ...ord.checkpoints, [key]: !ord.checkpoints[key] }
        };
      }
      return ord;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-semibold uppercase">
              Taller Operativo
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Módulo Mecánico: {user?.nombre || 'Técnico'}</h1>
          <p className="text-slate-500 text-sm">Bahías de trabajo y revisión técnica en vivo.</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm shadow-xs">
          <Clock size={16} className="text-brand-600" />
          <span className="text-slate-600">Tiempo objetivo cambio aceite: <strong className="text-slate-900">30 min</strong></span>
        </div>
      </div>

      {/* Bahías de trabajo */}
      <div className="grid gap-6 lg:grid-cols-3">
        {tallerOrders.map((ord) => (
          <div key={ord.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg border border-brand-200">
                  {ord.patente}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  ord.estado === 'En proceso' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  ord.estado === 'Listo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-sky-50 text-sky-700 border-sky-200'
                }`}>
                  {ord.estado}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{ord.vehiculo}</h3>
              <p className="text-xs text-slate-500">Cliente: {ord.cliente}</p>
              
              <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <p className="font-semibold text-brand-700 mb-1">Trabajo Solicitado:</p>
                <p>{ord.servicio}</p>
              </div>

              {/* Technical Checklist */}
              <div className="space-y-2 mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Checklist Preventivo:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button 
                    type="button" 
                    onClick={() => toggleCheck(ord.id, 'aceite')}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition ${
                      ord.checkpoints.aceite ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <CheckCircle2 size={14} className={ord.checkpoints.aceite ? 'text-emerald-600' : 'text-slate-400'} />
                    Cambio Aceite
                  </button>

                  <button 
                    type="button" 
                    onClick={() => toggleCheck(ord.id, 'filtro')}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition ${
                      ord.checkpoints.filtro ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <CheckCircle2 size={14} className={ord.checkpoints.filtro ? 'text-emerald-600' : 'text-slate-400'} />
                    Filtro Aceite
                  </button>

                  <button 
                    type="button" 
                    onClick={() => toggleCheck(ord.id, 'fluidos')}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition ${
                      ord.checkpoints.fluidos ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <CheckCircle2 size={14} className={ord.checkpoints.fluidos ? 'text-emerald-600' : 'text-slate-400'} />
                    Fluidos & Sapito
                  </button>

                  <button 
                    type="button" 
                    onClick={() => toggleCheck(ord.id, 'frenos')}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition ${
                      ord.checkpoints.frenos ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <CheckCircle2 size={14} className={ord.checkpoints.frenos ? 'text-emerald-600' : 'text-slate-400'} />
                    Pastillas/Luces
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Tiempo en fosa: <strong className="text-slate-900">{ord.tiempoTranscurrido}</strong> / {ord.tiempoEst}</span>
              <Link to="/ordenes" className="text-brand-600 font-semibold hover:underline">Ver detalle</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DASHBOARD CLIENTE (LIGHT MODE)
// -------------------------------------------------------------
function ClienteDashboard({ user }) {
  const vehiculoCliente = vehiculosData[0]; // Toyota Corolla

  // Business recommendation calculation
  const kilometrajeActual = vehiculoCliente?.kilometraje || 85000;
  const tipoAceiteActual = 'Sintético (10.000 - 15.000 KM)';
  const proximaMantencionKm = 95000;
  const kmRestantes = proximaMantencionKm - kilometrajeActual;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-semibold uppercase">
              Mi Panel de Cliente
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">¡Bienvenido(a), {user?.nombre || 'Cliente'}!</h1>
          <p className="text-slate-500 text-sm">Estado de tus vehículos y próximos servicios recomendados.</p>
        </div>

        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-brand-600/20"
        >
          <Calendar size={18} />
          Agendar Nueva Hora
        </Link>
      </div>

      {/* Recommended Oil Change Status Card */}
      <div className="bg-gradient-to-r from-brand-50 via-white to-white border border-brand-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-700 bg-brand-100/60 border border-brand-200 px-3 py-1 rounded-full">
              <Droplet size={14} /> Recomendación de Mantenimiento Preventivo
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Próximo cambio de aceite en <span className="text-brand-600">{kmRestantes.toLocaleString('es-CL')} KM</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Basado en tu aceite <strong className="text-slate-900">{tipoAceiteActual}</strong>, tu vehículo{' '}
              <strong className="text-slate-900">{vehiculoCliente.marca} {vehiculoCliente.modelo} ({vehiculoCliente.patente})</strong>{' '}
              está operando en condiciones óptimas.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center min-w-[200px]">
            <p className="text-xs text-slate-500">Kilometraje Actual</p>
            <p className="text-2xl font-black text-slate-900">{kilometrajeActual.toLocaleString('es-CL')} km</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Mantención al día</p>
          </div>
        </div>
      </div>

      {/* Active Service Status or History */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Car size={20} className="text-brand-600" /> Mis Vehículos Registrados
          </h3>

          <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-center text-brand-600">
                <Car size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{vehiculoCliente.marca} {vehiculoCliente.modelo}</h4>
                <p className="text-xs text-slate-500">Patente: <strong className="text-slate-800">{vehiculoCliente.patente}</strong> • Año: {vehiculoCliente.anio}</p>
                <p className="text-xs text-slate-400 mt-1">Último servicio: {vehiculoCliente.ultimoServicio}</p>
              </div>
            </div>
            <Link
              to="/ordenes"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 bg-white border border-slate-200 px-3 py-2 rounded-lg text-center shadow-2xs"
            >
              Ver Historial
            </Link>
          </div>
        </div>

        {/* Oil Standards Guide for Chilean drivers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-600" /> Guía de Aceites de Motor
          </h3>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-amber-700">Aceite Mineral</span>
              <p className="text-slate-500 mt-0.5">Reemplazo recomendado cada <strong>5.000 km</strong>.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-sky-700">Aceite Semisintético</span>
              <p className="text-slate-500 mt-0.5">Reemplazo recomendado cada <strong>10.000 km</strong>.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-emerald-700">Aceite Sintético</span>
              <p className="text-slate-500 mt-0.5">Reemplazo recomendado cada <strong>10.000 a 15.000 km</strong>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
