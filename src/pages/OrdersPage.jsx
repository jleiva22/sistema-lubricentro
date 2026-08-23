import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Search, ChevronDown, CheckCircle2, XCircle, Play, CreditCard } from 'lucide-react';
import { ordenesAPI } from '../services/api';
import { useAuth } from '../context/useAuth';

const estadoStyles = {
  solicitado: 'bg-violet-50 text-violet-700 border border-violet-200',
  agendada: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  recepcionado: 'bg-sky-50 text-sky-700 border border-sky-200',
  en_proceso: 'bg-amber-50 text-amber-700 border border-amber-200',
  completado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pagado: 'bg-teal-50 text-teal-700 border border-teal-200',
  cancelado: 'bg-red-50 text-red-600 border border-red-200',
};

const estadoLabels = {
  solicitado: 'Solicitado',
  agendada: 'Agendada',
  recepcionado: 'Recepcionado',
  en_proceso: 'En Proceso',
  completado: 'Completado',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
};

// Transiciones válidas de estado para la UI
const NEXT_ACTIONS = {
  solicitado: [
    { estado: 'agendada', label: 'Agendar', icon: CheckCircle2, color: 'text-indigo-600 hover:bg-indigo-50' },
    { estado: 'recepcionado', label: 'Recepcionar', icon: Play, color: 'text-sky-600 hover:bg-sky-50' },
    { estado: 'cancelado', label: 'Cancelar', icon: XCircle, color: 'text-red-600 hover:bg-red-50' },
  ],
  agendada: [
    { estado: 'recepcionado', label: 'Recepcionar', icon: Play, color: 'text-sky-600 hover:bg-sky-50' },
    { estado: 'cancelado', label: 'Cancelar', icon: XCircle, color: 'text-red-600 hover:bg-red-50' },
  ],
  recepcionado: [
    { estado: 'en_proceso', label: 'Iniciar Trabajo', icon: Play, color: 'text-amber-600 hover:bg-amber-50' },
    { estado: 'cancelado', label: 'Cancelar', icon: XCircle, color: 'text-red-600 hover:bg-red-50' },
  ],
  en_proceso: [
    { estado: 'completado', label: 'Completar', icon: CheckCircle2, color: 'text-emerald-600 hover:bg-emerald-50' },
    { estado: 'cancelado', label: 'Cancelar', icon: XCircle, color: 'text-red-600 hover:bg-red-50' },
  ],
  completado: [
    { estado: 'pagado', label: 'Marcar Pagado', icon: CreditCard, color: 'text-teal-600 hover:bg-teal-50' },
  ],
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [actionMenuId, setActionMenuId] = useState(null);

  const isAdmin = user?.rol === 'administrador';
  const isMecanico = user?.rol === 'mecanico';
  const isCliente = user?.rol === 'cliente';
  const canManage = isAdmin || isMecanico;

  const fetchOrdenes = useCallback(async () => {
    try {
      const { data } = await ordenesAPI.getAll();
      if (Array.isArray(data)) {
        setOrdenes(data);
      } else {
        setOrdenes([]);
      }
    } catch {
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdenes();
  }, [fetchOrdenes]);

  const handleEstadoChange = async (ordenId, nuevoEstado) => {
    try {
      if (nuevoEstado === 'pagado') {
        await ordenesAPI.pagar(ordenId);
      } else {
        await ordenesAPI.updateEstado(ordenId, nuevoEstado);
      }
      setActionMenuId(null);
      await fetchOrdenes();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredOrdenes = ordenes.filter((o) => {
    const clienteName = o.cliente || `${o.vehiculo?.cliente?.nombre || ''} ${o.vehiculo?.cliente?.apellido || ''}`;
    const patente = o.vehiculo?.patente || o.vehiculo || '';
    const q = search.toLowerCase();
    const matchSearch = clienteName.toLowerCase().includes(q) || patente.toLowerCase().includes(q) || String(o.id).includes(q);
    const matchEstado = !filtroEstado || o.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const contadores = ordenes.reduce((acc, o) => {
    acc[o.estado] = (acc[o.estado] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">Operación</p>
          <h1 className="text-3xl font-bold text-slate-900">Órdenes de trabajo</h1>
        </div>

        {canManage && (
          <Link
            to="/ordenes/nueva"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700 shadow-md shadow-brand-600/20 text-sm"
          >
            <Plus size={18} />
            Nueva orden
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        {/* Barra de búsqueda y filtro */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500">
            <Search size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por patente, cliente o N° de orden"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-brand-600 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            {Object.entries(estadoLabels).map(([key, label]) => (
              <option key={key} value={key}>{label} ({contadores[key] || 0})</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Cargando órdenes...</div>
        ) : filteredOrdenes.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <ClipboardList size={36} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No se encontraron órdenes</p>
            <p className="text-xs text-slate-500">Intenta cambiar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  {!isCliente && <th className="px-4 py-3 font-semibold">N°</th>}
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Vehículo / Patente</th>
                  <th className="px-4 py-3 font-semibold">Servicio(s)</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  {canManage && <th className="px-4 py-3 font-semibold text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filteredOrdenes.map((orden) => {
                  const clienteNombre = orden.cliente || `${orden.vehiculo?.cliente?.nombre || 'Cliente'} ${orden.vehiculo?.cliente?.apellido || ''}`;
                  const vehiculoStr = orden.vehiculo?.patente ? `${orden.vehiculo.marca} ${orden.vehiculo.modelo} (${orden.vehiculo.patente})` : orden.vehiculo;
                  const servicioStr = orden.detalles?.map(d => d.servicio?.nombre).join(', ') || orden.tipo || orden.observaciones_fallas || 'Cambio de Aceite';
                  const estadoDisplay = orden.estado || 'recepcionado';
                  const totalNum = Number(orden.total || 0);
                  const actions = canManage ? (NEXT_ACTIONS[estadoDisplay] || []) : [];

                  return (
                    <tr key={orden.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50/80">
                      {!isCliente && <td className="px-4 py-4 font-bold text-brand-600">#{orden.id}</td>}
                      <td className="px-4 py-4 font-medium text-slate-900">{clienteNombre}</td>
                      <td className="px-4 py-4 font-mono font-semibold">{vehiculoStr}</td>
                      <td className="px-4 py-4 text-xs max-w-[200px] truncate" title={servicioStr}>{servicioStr}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${estadoStyles[estadoDisplay] || 'bg-slate-100 text-slate-700'}`}>
                          {estadoLabels[estadoDisplay] || estadoDisplay}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900">${totalNum.toLocaleString('es-CL')}</td>
                      {canManage && (
                        <td className="px-4 py-4 text-center relative">
                          {actions.length > 0 ? (
                            <div className="relative inline-block">
                              <button
                                type="button"
                                onClick={() => setActionMenuId(actionMenuId === orden.id ? null : orden.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                              >
                                <ChevronDown size={14} />
                                Acción
                              </button>

                              {actionMenuId === orden.id && (
                                <div className="absolute right-0 top-full mt-1 z-30 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                                  {actions.map((action) => (
                                    <button
                                      key={action.estado}
                                      type="button"
                                      onClick={() => handleEstadoChange(orden.id, action.estado)}
                                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition cursor-pointer ${action.color}`}
                                    >
                                      <action.icon size={14} />
                                      {action.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Total órdenes</span>
            <ClipboardList size={18} className="text-brand-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{ordenes.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Pendientes</span>
            <ClipboardList size={18} className="text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {ordenes.filter(o => ['solicitado', 'agendada', 'recepcionado', 'en_proceso'].includes(o.estado)).length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Completadas</span>
            <ClipboardList size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {ordenes.filter(o => ['completado', 'pagado'].includes(o.estado)).length}
          </div>
        </div>

        {!isCliente && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between text-slate-500">
              <span className="text-sm font-medium">Ingresos</span>
              <ClipboardList size={18} className="text-brand-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              ${ordenes.reduce((acc, curr) => acc + Number(curr.total || 0), 0).toLocaleString('es-CL')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
