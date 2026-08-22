import { Link } from 'react-router-dom';
import { Users, Mail, Phone } from 'lucide-react';
import { clientesData } from '../data/mockData';

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">CRM</p>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
        </div>
        <Link to="/clientes/nuevo" className="rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 shadow-md shadow-brand-600/20 text-sm">
          Nuevo cliente
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clientesData.map((cliente) => (
          <div key={cliente.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
                <Users size={22} />
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${cliente.activo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {cliente.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">{cliente.nombre} {cliente.apellido}</h2>
            <p className="mt-1 text-xs text-slate-500 font-medium">RUT: {cliente.rut}</p>

            <div className="mt-5 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-brand-600" />
                {cliente.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-brand-600" />
                {cliente.telefono}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
