import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { Link } from 'react-router-dom';
import {
  Users, Car, ClipboardList, TrendingUp, Wrench,
  CheckCircle2, Clock, Calendar, Droplet, ShieldCheck, Plus, ChevronRight, Loader2
} from 'lucide-react';
import { ordenesAPI, clientesAPI, vehiculosAPI } from '../services/api';

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
// DASHBOARD ADMINISTRADOR
// -------------------------------------------------------------
function AdminDashboard({ user }) {
  const [ordenes, setOrdenes] = useState([]);
  const [clientesCount, setClientesCount] = useState(0);
  const [vehiculosCount, setVehiculosCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const [ordRes, cliRes, vehRes] = await Promise.allSettled([
          ordenesAPI.getAll(),
          clientesAPI.getAll(),
          vehiculosAPI.getAll(),
        ]);

        if (!isMounted) return;

        if (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value.data)) {
          setOrdenes(ordRes.value.data);
        }
        if (cliRes.status === 'fulfilled' && Array.isArray(cliRes.value.data)) {
          setClientesCount(cliRes.value.data.length);
        }
        if (vehRes.status === 'fulfilled' && Array.isArray(vehRes.value.data)) {
          setVehiculosCount(vehRes.value.data.length);
        }
      } catch (err) {
        console.error('Error cargando datos de administración:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  const totalIngresos = ordenes.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
  const ordenesHoy = ordenes.filter(o => {
    if (!o.fecha_ingreso && !o.createdAt) return false;
    const fecha = new Date(o.fecha_ingreso || o.createdAt);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }).length;

  const stats = [
    { label: 'Órdenes Hoy', value: ordenesHoy.toString(), icon: ClipboardList, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Clientes Registrados', value: clientesCount.toString(), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Vehículos Registrados', value: vehiculosCount.toString(), icon: Car, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Ingresos Totales', value: `$${totalIngresos.toLocaleString('es-CL')}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
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
          <p className="text-slate-500 text-sm">Resumen en tiempo real del lubricentro.</p>
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

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm">
              <Loader2 size={20} className="animate-spin text-brand-600" />
              Cargando órdenes...
            </div>
          ) : ordenes.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <ClipboardList size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No hay órdenes registradas aún</p>
              <p className="text-xs text-slate-500 mt-1">Las órdenes creadas en el sistema o reservadas desde la web aparecerán aquí.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ordenes.slice(0, 5).map((orden) => {
                const clienteStr = orden.vehiculo?.cliente ? `${orden.vehiculo.cliente.nombre} ${orden.vehiculo.cliente.apellido || ''}` : (orden.cliente || 'Cliente General');
                const vehiculoStr = orden.vehiculo ? `${orden.vehiculo.marca} ${orden.vehiculo.modelo} (${orden.vehiculo.patente})` : 'Vehículo';
                const totalNum = Number(orden.total || 0);

                return (
                  <div key={orden.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-brand-600 text-sm">#{orden.id}</span>
                        <p className="font-medium text-slate-900 text-sm">{clienteStr}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{vehiculoStr}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">${totalNum.toLocaleString('es-CL')}</p>
                      <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-semibold mt-1 border capitalize ${orden.estado === 'pagado' || orden.estado === 'completado'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {orden.estado?.replace('_', ' ') || 'recepcionado'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Estado del Sistema</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-slate-600">Total Órdenes Registradas</span>
              <span className="font-bold text-slate-900">{ordenes.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-slate-600">Órdenes Pagadas</span>
              <span className="font-bold text-emerald-600">
                {ordenes.filter(o => o.pagado || o.estado === 'pagado').length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-slate-600">Órdenes en Proceso</span>
              <span className="font-bold text-amber-600">
                {ordenes.filter(o => o.estado === 'en_proceso' || o.estado === 'recepcionado').length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <span className="font-bold text-emerald-600">Conectado (Producción)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DASHBOARD MECÁNICO
// -------------------------------------------------------------
function MecanicoDashboard({ user }) {
  const [tallerOrders, setTallerOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTallerOrders = async () => {
    try {
      const { data } = await ordenesAPI.getAll();
      if (Array.isArray(data)) {
        // Map backend orders to taller view
        const mapped = data.map(ord => ({
          id: ord.id,
          patente: ord.vehiculo?.patente || 'S/P',
          vehiculo: ord.vehiculo ? `${ord.vehiculo.marca} ${ord.vehiculo.modelo}` : 'Vehículo',
          cliente: ord.vehiculo?.cliente ? `${ord.vehiculo.cliente.nombre} ${ord.vehiculo.cliente.apellido || ''}` : (ord.cliente || 'Cliente Express'),
          servicio: ord.detalles?.map(d => d.servicio?.nombre).join(', ') || ord.observaciones_fallas || 'Mantención General',
          estado: ord.estado || 'recepcionado',
          checkpoints: { aceite: true, filtro: true, fluidos: false, frenos: false }
        }));
        setTallerOrders(mapped);
      }
    } catch (err) {
      console.error('Error cargando órdenes de taller:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTallerOrders();
  }, []);

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

  const handleUpdateStatus = async (orderId, nuevoEstado) => {
    try {
      await ordenesAPI.updateEstado(orderId, nuevoEstado);
      fetchTallerOrders();
    } catch (err) {
      alert('Error al actualizar estado: ' + (err.response?.data?.message || err.message));
    }
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

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm bg-white rounded-2xl border border-slate-200">
          <Loader2 size={22} className="animate-spin text-amber-600" />
          Cargando bahías de trabajo...
        </div>
      ) : tallerOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Wrench size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No hay vehículos en fosa actualmente</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Las órdenes creadas por administración o agendadas por clientes aparecerán automáticamente aquí.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {tallerOrders.map((ord) => (
            <div key={ord.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg border border-brand-200">
                    {ord.patente}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border capitalize ${ord.estado === 'en_proceso' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    ord.estado === 'completado' || ord.estado === 'pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                    {ord.estado?.replace('_', ' ')}
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
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition cursor-pointer ${ord.checkpoints.aceite ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                    >
                      <CheckCircle2 size={14} className={ord.checkpoints.aceite ? 'text-emerald-600' : 'text-slate-400'} />
                      Cambio Aceite
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCheck(ord.id, 'filtro')}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition cursor-pointer ${ord.checkpoints.filtro ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                    >
                      <CheckCircle2 size={14} className={ord.checkpoints.filtro ? 'text-emerald-600' : 'text-slate-400'} />
                      Filtro Aceite
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCheck(ord.id, 'fluidos')}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition cursor-pointer ${ord.checkpoints.fluidos ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                    >
                      <CheckCircle2 size={14} className={ord.checkpoints.fluidos ? 'text-emerald-600' : 'text-slate-400'} />
                      Fluidos
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCheck(ord.id, 'frenos')}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition cursor-pointer ${ord.checkpoints.frenos ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                    >
                      <CheckCircle2 size={14} className={ord.checkpoints.frenos ? 'text-emerald-600' : 'text-slate-400'} />
                      Pastillas/Luces
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {ord.estado === 'recepcionado' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'en_proceso')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg transition text-[11px]"
                    >
                      Iniciar Trabajo
                    </button>
                  )}
                  {ord.estado === 'en_proceso' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'completado')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition text-[11px]"
                    >
                      Marcar Listo
                    </button>
                  )}
                </div>
                <Link to="/ordenes" className="text-brand-600 font-semibold hover:underline">Ver detalle</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// DASHBOARD CLIENTE
// -------------------------------------------------------------
function ClienteDashboard({ user }) {
  const [misVehiculos, setMisVehiculos] = useState([]);
  const [misOrdenes, setMisOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchClienteData = async () => {
      try {
        const [vRes, oRes] = await Promise.allSettled([
          vehiculosAPI.getAll(),
          ordenesAPI.getAll(),
        ]);

        if (!isMounted) return;

        if (vRes.status === 'fulfilled' && Array.isArray(vRes.value.data)) {
          setMisVehiculos(vRes.value.data);
        }
        if (oRes.status === 'fulfilled' && Array.isArray(oRes.value.data)) {
          setMisOrdenes(oRes.value.data);
        }
      } catch (err) {
        console.error('Error cargando datos cliente:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClienteData();
    return () => { isMounted = false; };
  }, [user]);

  const vehiculoPrincipal = misVehiculos[0] || null;

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
          <p className="text-slate-500 text-sm">Estado de tus vehículos y historial de mantenciones.</p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-brand-600/20"
        >
          <Calendar size={18} />
          Agendar Nueva Hora
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm bg-white rounded-2xl border border-slate-200">
          <Loader2 size={22} className="animate-spin text-emerald-600" />
          Cargando tu información...
        </div>
      ) : (
        <>
          {/* Recommended Oil Change Status Card */}
          <div className="bg-gradient-to-r from-brand-50 via-white to-white border border-brand-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-700 bg-brand-100/60 border border-brand-200 px-3 py-1 rounded-full">
                  <Droplet size={14} /> Recomendación de Mantenimiento Preventivo
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {vehiculoPrincipal ? (
                    <>Mantenimiento al día para <span className="text-brand-600">{vehiculoPrincipal.marca} {vehiculoPrincipal.modelo} ({vehiculoPrincipal.patente})</span></>
                  ) : (
                    <>¿Listo para agendar tu primera mantención?</>
                  )}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Recuerda realizar el cambio de aceite sintético cada 10.000 a 15.000 KM para mantener tu motor en óptimas condiciones de lubricación.
                </p>
              </div>

              {vehiculoPrincipal && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center min-w-[200px]">
                  <p className="text-xs text-slate-500">Kilometraje Registrado</p>
                  <p className="text-2xl font-black text-slate-900">{(vehiculoPrincipal.kilometraje_actual || 0).toLocaleString('es-CL')} km</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Mantención al día</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Service Status or History */}
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Car size={20} className="text-brand-600" /> Mis Vehículos Registrados
              </h3>

              {misVehiculos.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Car size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No tienes vehículos asociados todavía</p>
                  <p className="text-xs text-slate-500 mt-1">Al agendar una hora o atención en fosa, tu vehículo aparecerá en esta sección.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {misVehiculos.map((v) => (
                    <div key={v.id} className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-center text-brand-600">
                          <Car size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{v.marca} {v.modelo}</h4>
                          <p className="text-xs text-slate-500">Patente: <strong className="text-slate-800">{v.patente}</strong> • Año: {v.anio}</p>
                          <p className="text-xs text-slate-400 mt-1">KM Actual: {(v.kilometraje_actual || 0).toLocaleString('es-CL')} km</p>
                        </div>
                      </div>
                      <Link
                        to="/ordenes"
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 bg-white border border-slate-200 px-3 py-2 rounded-lg text-center shadow-2xs"
                      >
                        Ver Historial
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Oil Standards Guide */}
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
        </>
      )}
    </div>
  );
}

