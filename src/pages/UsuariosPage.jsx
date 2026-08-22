import { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Users } from 'lucide-react';
import { usuariosAPI } from '../services/api';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchUsuarios = async () => {
      try {
        const { data } = await usuariosAPI.getAll();
        if (isMounted && Array.isArray(data)) {
          setUsuarios(data);
        }
      } catch (err) {
        console.error('Error cargando usuarios:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUsuarios();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">Acceso</p>
          <h1 className="text-3xl font-bold text-slate-900">Usuarios</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm bg-white rounded-2xl border border-slate-200">
          <Loader2 size={22} className="animate-spin text-brand-600" />
          Cargando usuarios...
        </div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <Users size={36} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No hay usuarios del sistema registrados</h3>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {usuarios.map((usuario) => (
            <div key={usuario.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
                  <ShieldCheck size={22} />
                </div>
                <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-semibold uppercase">
                  {usuario.rol}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{usuario.nombre} {usuario.apellido || ''}</h2>
              <p className="mt-1 text-xs text-slate-500 font-medium">{usuario.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

