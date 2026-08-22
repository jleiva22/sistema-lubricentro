import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, Search } from 'lucide-react';
import { ordenesAPI } from '../services/api';

const estadoStyles = {
  recepcionado: 'bg-sky-50 text-sky-700 border border-sky-200',
  en_proceso: 'bg-amber-50 text-amber-700 border border-amber-200',
  completado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pagado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export default function OrdersPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchOrdenes = async () => {
      try {
        const { data } = await ordenesAPI.getAll();
        if (isMounted) {
          if (Array.isArray(data)) {
            setOrdenes(data);
          } else {
            setOrdenes([]);
          }
        }
      } catch (err) {
        if (isMounted) setOrdenes([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrdenes();
    return () => { isMounted = false; };
  }, []);

  const filteredOrdenes = ordenes.filter((o) => {
    const clienteName = o.cliente || `${o.vehiculo?.cliente?.nombre || ''} ${o.vehiculo?.cliente?.apellido || ''}`;
    const patente = o.vehiculo?.patente || o.vehiculo || '';
    const q = search.toLowerCase();
    return clienteName.toLowerCase().includes(q) || patente.toLowerCase().includes(q) || String(o.id).includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">Operación (BD MySQL)</p>
          <h1 className="text-3xl font-bold text-slate-900">Órdenes de trabajo</h1>
        </div>

        <Link
          to="/ordenes/nueva"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700 shadow-md shadow-brand-600/20 text-sm"
        >
          <Plus size={18} />
          Nueva orden
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500">
          <Search size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por patente, cliente o N° de orden"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Cargando órdenes desde MySQL...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="px-4 py-3 font-semibold">N°</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Vehículo / Patente</th>
                  <th className="px-4 py-3 font-semibold">Observación / Servicio</th>
                  <th className="px-4 py-3 font-semibold">Estado BD</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrdenes.map((orden) => {
                  const clienteNombre = orden.cliente || `${orden.vehiculo?.cliente?.nombre || 'Cliente'} ${orden.vehiculo?.cliente?.apellido || ''}`;
                  const vehiculoStr = orden.vehiculo?.patente ? `${orden.vehiculo.marca} ${orden.vehiculo.modelo} (${orden.vehiculo.patente})` : orden.vehiculo;
                  const servicioStr = orden.detalles?.map(d => d.servicio?.nombre).join(', ') || orden.tipo || orden.observaciones_fallas || 'Cambio de Aceite';
                  const estadoDisplay = orden.estado || 'recepcionado';
                  const totalNum = Number(orden.total || 0);

                  return (
                    <tr key={orden.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50/80">
                      <td className="px-4 py-4 font-bold text-brand-600">#{orden.id}</td>
                      <td className="px-4 py-4 font-medium text-slate-900">{clienteNombre}</td>
                      <td className="px-4 py-4 font-mono font-semibold">{vehiculoStr}</td>
                      <td className="px-4 py-4 text-xs">{servicioStr}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${estadoStyles[estadoDisplay] || 'bg-slate-100 text-slate-700'}`}>
                          {estadoDisplay.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900">${totalNum.toLocaleString('es-CL')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Total de órdenes</span>
            <ClipboardList size={18} className="text-brand-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{filteredOrdenes.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Promedio de atención</span>
            <ClipboardList size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">45 min</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between text-slate-500">
            <span className="text-sm font-medium">Ingresos BD (Suma Total)</span>
            <ClipboardList size={18} className="text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            ${filteredOrdenes.reduce((acc, curr) => acc + Number(curr.total || 0), 0).toLocaleString('es-CL')}
          </div>
        </div>
      </div>
    </div>
  );
}
