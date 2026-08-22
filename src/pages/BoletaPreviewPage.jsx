import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function BoletaPreviewPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const order = state ?? {
    cliente: { nombre: 'Ana', apellido: 'Contreras', email: 'ana.contreras@gmail.com', telefono: '+56 9 1234 5678' },
    vehiculo: { marca: 'Toyota', modelo: 'Corolla', patente: 'AB-1234', anio: 2022 },
    servicios: [
      { id: 1, nombre: 'Cambio de aceite sintético Mobil 1', tiempoEstimado: '45 min', precio: 59000 },
      { id: 4, nombre: 'Control y cambio de filtro de aceite', tiempoEstimado: '20 min', precio: 12000 },
    ],
    subtotal: 71000,
    iva: 13490,
    total: 84490,
    incluirIva: true,
    diagnostico: 'Cambio de aceite sintético de alta gama. Filtro reemplazado. Niveles de fluido e inspección de neumáticos OK.',
    fechaIngreso: new Date().toISOString().slice(0, 10),
  };

  const subtotal = Number(order.subtotal ?? 0);
  const iva = Number(order.iva ?? 0);
  const total = Number(order.total ?? subtotal + iva);
  const numeroBoleta = 1003;

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
            <CheckCircle2 size={14} /> Pago Registrado / Boleta Electrónica
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
            <p className="text-2xl font-black text-slate-900">N° 000{numeroBoleta}</p>
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
                  <th className="px-4 py-3 font-semibold">Tiempo Est.</th>
                  <th className="px-4 py-3 font-semibold text-right">Monto (CLP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(order.servicios ?? []).map((servicio) => (
                  <tr key={servicio.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900 font-medium">{servicio.nombre}</td>
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
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">Observaciones Técnicas de Fosa</p>
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
