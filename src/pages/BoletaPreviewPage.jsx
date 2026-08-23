import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

const normalizeOrder = (incomingState) => {
  const order = incomingState ?? {};

  const servicios = (order.servicios ?? []).map((servicio) => ({
    id: servicio.id,
    nombre: servicio.nombre || 'Servicio',
    marca: servicio.marca || 'Multimarca',
    tiempoEstimado: servicio.tiempoEstimado || `${Number(servicio.tiempo_minutos ?? 30)} min`,
    precio: Number(servicio.precio ?? servicio.precio_unitario ?? 0),
  }));

  const subtotal = Number(order.subtotal ?? servicios.reduce((sum, s) => sum + Number(s.precio || 0), 0));
  const iva = Number(order.iva ?? (order.incluirIva ? subtotal * 0.19 : 0));
  const total = Number(order.total ?? subtotal + iva);

  return {
    cliente: order.cliente ?? { nombre: 'Cliente', apellido: '', email: 'sin-email@lubricentro.cl', telefono: '+56 9 0000 0000' },
    vehiculo: order.vehiculo ?? { marca: 'Vehículo', modelo: 'General', patente: 'SN', anio: new Date().getFullYear() },
    servicios,
    subtotal,
    iva,
    total,
    incluirIva: order.incluirIva ?? true,
    diagnostico: order.diagnostico || 'Sin observaciones registradas.',
    fechaIngreso: order.fechaIngreso || new Date().toISOString().slice(0, 10),
    ordenId: order.ordenId ?? 0,
  };
};

export default function BoletaPreviewPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = normalizeOrder(state);

  const subtotal = Number(order.subtotal ?? 0);
  const iva = Number(order.iva ?? 0);
  const total = Number(order.total ?? subtotal + iva);
  const numeroBoleta = order.ordenId ? String(order.ordenId).padStart(4, '0') : '0001';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation & Action Bar (Hidden on print) */}
      <div className="no-print flex items-center justify-between gap-3 bg-surface-800 p-4 rounded-2xl border border-surface-700">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-surface-600 px-4 py-2.5 text-sm font-medium text-surface-200 transition hover:border-brand-500 hover:text-white cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Boleta lista para impresión
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700 shadow-lg shadow-brand-600/25 cursor-pointer text-sm"
          >
            <Printer size={18} />
            Imprimir Boleta
          </button>
        </div>
      </div>

      {/* Printable Receipt Card */}
      <div className="print-area rounded-2xl border border-surface-700 bg-white p-8 text-slate-900 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">LUBRIEXPRESS CHILE</h1>
            <p className="mt-1 text-sm font-semibold text-slate-700">RUT Empresa: 76.456.901-2</p>
            <p className="text-xs text-slate-600">Servicios de Mantenimiento Preventivo & Lubricentro</p>
            <p className="text-xs text-slate-600">Av. Alemania 1020, Temuco • Tel: +56 45 221 4455</p>
          </div>

          <div className="text-right bg-slate-100 p-4 rounded-xl border border-slate-300">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Boleta Electrónica</p>
            <p className="text-2xl font-black text-slate-900">N° {numeroBoleta}</p>
            <p className="text-xs font-medium text-slate-600 mt-1">Fecha Emisión: {order.fechaIngreso}</p>
          </div>
        </div>

        {/* Client & Vehicle Info Grid */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Datos del Cliente</p>
            <p className="font-bold text-slate-900 text-base">{order.cliente?.nombre} {order.cliente?.apellido}</p>
            <p className="text-xs text-slate-700 mt-1">Email notificaciones: <strong>{order.cliente?.email}</strong></p>
            <p className="text-xs text-slate-700">Teléfono contacto: <strong>{order.cliente?.telefono}</strong></p>
          </div>

          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Datos del Vehículo</p>
            <p className="font-bold text-slate-900 text-base">{order.vehiculo?.marca} {order.vehiculo?.modelo}</p>
            <p className="text-xs text-slate-700 mt-1">Patente: <strong className="text-slate-900 font-mono bg-slate-200 px-1.5 py-0.5 rounded">{order.vehiculo?.patente}</strong></p>
            <p className="text-xs text-slate-700 mt-0.5">Año: {order.vehiculo?.anio}</p>
          </div>
        </div>

        {/* Itemized Services Table */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">Desglose de Servicios Realizados</p>

          <div className="overflow-hidden rounded-xl border border-slate-300">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Detalle del Servicio / Producto</th>
                  <th className="px-4 py-3 font-semibold">Marca</th>
                  <th className="px-4 py-3 font-semibold">Tiempo Est.</th>
                  <th className="px-4 py-3 font-semibold text-right">Monto (CLP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.servicios.map((servicio) => (
                  <tr key={servicio.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900 font-medium">{servicio.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{servicio.marca}</td>
                    <td className="px-4 py-3 text-slate-600">{servicio.tiempoEstimado}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">${Number(servicio.precio).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observations / Diagnostic */}
        <div className="mt-6 rounded-xl bg-slate-100 p-4 border border-slate-200">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">Observaciones Técnicas</p>
          <p className="text-xs text-slate-800 leading-relaxed">{order.diagnostico}</p>
        </div>

        {/* Totals Breakdown */}
        <div className="mt-6 ml-auto max-w-xs space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-300">
          <div className="flex items-center justify-between">
            <span>Subtotal Neto</span>
            <span className="font-semibold">${subtotal.toLocaleString('es-CL')}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>IVA (19%)</span>
            <span>${iva.toLocaleString('es-CL')}</span>
          </div>
          <div className="flex items-center justify-between border-t-2 border-slate-900 pt-2 text-base font-black text-slate-900">
            <span>Total Boleta</span>
            <span className="text-emerald-700">${total.toLocaleString('es-CL')}</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[11px] text-slate-500">
          <p>¡Gracias por su preferencia! Se ha notificado al cliente vía correo/teléfono.</p>
          <p className="font-medium text-slate-700 mt-0.5">LubriExpress Chile • Garantía de Servicio Preventivo</p>
        </div>
      </div>
    </div>
  );
}
