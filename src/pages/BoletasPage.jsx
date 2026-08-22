import { Link } from 'react-router-dom';
import { FileText, Printer } from 'lucide-react';
import { boletasData } from '../data/mockData';

export default function BoletasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">Facturación</p>
          <h1 className="text-3xl font-bold text-slate-900">Boletas emitidas</h1>
        </div>

        <Link
          to="/boletas/preview"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 shadow-md shadow-brand-600/20 text-sm"
        >
          <Printer size={18} />
          Ver vista de boleta
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <th className="px-4 py-3 font-semibold">N° Boleta</th>
              <th className="px-4 py-3 font-semibold">Orden</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">RUT</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {boletasData.map((boleta) => (
              <tr key={boleta.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50">
                <td className="px-4 py-4 font-bold text-brand-600">#{boleta.id}</td>
                <td className="px-4 py-4 font-semibold text-slate-800">#{boleta.ordenId}</td>
                <td className="px-4 py-4 font-medium text-slate-900">{boleta.cliente}</td>
                <td className="px-4 py-4">{boleta.rut}</td>
                <td className="px-4 py-4">{boleta.fecha}</td>
                <td className="px-4 py-4 font-bold text-slate-900">${boleta.total.toLocaleString('es-CL')}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${boleta.pagado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {boleta.pagado ? 'Pagada' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Formato de boleta</h2>
            <p className="text-xs text-slate-500">Nombre de la empresa, RUT, servicios, IVA y contacto del cliente.</p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-xs text-slate-700">
          <div className="mb-3 flex justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900">LubriExpress Chile</span>
            <span className="font-semibold text-slate-600">RUT: 76.456.901-2</span>
          </div>
          <div className="space-y-1.5">
            <p><strong>Cliente:</strong> Ana Contreras</p>
            <p><strong>Contacto:</strong> +56 9 1234 5678 / ana.contreras@gmail.com</p>
            <p><strong>Servicio:</strong> Cambio de aceite sintético</p>
            <p><strong>Total con IVA:</strong> <strong className="text-emerald-700">$59.200</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
