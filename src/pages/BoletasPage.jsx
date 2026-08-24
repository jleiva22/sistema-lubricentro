import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Printer, Loader2, Eye } from 'lucide-react';
import { boletasAPI } from '../services/api';

export default function BoletasPage() {
  const [boletas, setBoletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchBoletas = async () => {
      try {
        const response = await boletasAPI.getAll();
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        if (isMounted) {
          setBoletas(data);
        }
      } catch (err) {
        console.error('Error cargando boletas:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBoletas();
    return () => { isMounted = false; };
  }, []);

  const handleVerBoleta = (boleta) => {
  navigate(`/boletas/preview?id=${boleta.id}`, { state: { boleta } });
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">Facturación</p>
          <h1 className="text-3xl font-bold text-slate-900">Boletas emitidas</h1>
        </div>

        {/* <Link
          to="/boletas/preview"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 shadow-md shadow-brand-600/20 text-sm"
        >
          <Printer size={18} />
          Ver vista previa general
        </Link> */}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm bg-white rounded-2xl border border-slate-200">
          <Loader2 size={22} className="animate-spin text-brand-600" />
          Cargando boletas...
        </div>
      ) : boletas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText size={36} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No hay boletas emitidas</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Las boletas asociadas a las órdenes finalizadas aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="px-4 py-3 font-semibold">N° Boleta</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Vehículo</th>
                <th className="px-4 py-3 font-semibold">Fecha Emisión</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {boletas.map((boleta) => {
                // Extracción de datos desde boleta.orden.vehiculo
                const orden = boleta.orden;
                const vehiculo = orden?.vehiculo || boleta.vehiculo;
                const cliente = vehiculo?.cliente || orden?.cliente;

                const clienteStr = cliente
                  ? `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim()
                  : (boleta.cliente_nombre || 'Cliente General');

                const vehiculoStr = vehiculo
                  ? `${vehiculo.marca || ''} ${vehiculo.modelo || ''} (${vehiculo.patente || ''})`.trim()
                  : '-';

                const fechaStr = boleta.fecha_emision
                  ? new Date(boleta.fecha_emision).toLocaleDateString('es-CL')
                  : (orden?.fecha_ingreso ? new Date(orden.fecha_ingreso).toLocaleDateString('es-CL') : 'Reciente');

                const pagado = boleta.estado === 'emitida' || boleta.estado === 'pagado' || boleta.estado === 'completado';

                return (
                  <tr key={boleta.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-bold text-brand-600">
                      {boleta.numero_boleta || `#${boleta.id}`}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-900">{clienteStr}</td>
                    <td className="px-4 py-4 font-medium text-slate-600">{vehiculoStr}</td>
                    <td className="px-4 py-4">{fechaStr}</td>
                    <td className="px-4 py-4 font-bold text-slate-900">
                      ${Number(boleta.total || 0).toLocaleString('es-CL')}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${pagado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {pagado ? 'Emitida / Pagada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleVerBoleta(boleta)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition cursor-pointer"
                        title="Ver / Imprimir Boleta"
                      >
                        <Eye size={14} />
                        Ver Boleta
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Formato de boleta SII</h2>
            <p className="text-xs text-slate-500">Nombre de la empresa, RUT, servicios, IVA y contacto del cliente.</p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-xs text-slate-700">
          <div className="mb-3 flex justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900">LubriExpress Chile SpA</span>
            <span className="font-semibold text-slate-600">RUT: 76.456.901-2</span>
          </div>
          <div className="space-y-1.5">
            <p><strong>Régimen:</strong> Emisión Electrónica</p>
            <p><strong>Atención Taller:</strong> Cambio de aceite, filtros y chequeo preventivo 21 puntos</p>
            <p><strong>Impuestos:</strong> IVA (19%) incluido en valor total de orden</p>
          </div>
        </div>
      </div>
    </div>
  );
}