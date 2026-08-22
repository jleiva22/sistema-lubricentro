import { ShieldCheck } from 'lucide-react';
import { usuariosData } from '../data/mockData';

export default function UsuariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">Acceso</p>
          <h1 className="text-3xl font-bold text-slate-900">Usuarios</h1>
        </div>
        <button className="rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 shadow-md shadow-brand-600/20 text-sm cursor-pointer">
          Crear usuario
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {usuariosData.map((usuario) => (
          <div key={usuario.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
                <ShieldCheck size={22} />
              </div>
              <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-semibold">
                {usuario.rol}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">{usuario.nombre} {usuario.apellido}</h2>
            <p className="mt-1 text-xs text-slate-500 font-medium">{usuario.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
