import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Mail, Phone, Loader2 } from 'lucide-react';
import { clientesAPI } from '../services/api';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchClientes = async () => {
      try {
        const { data } = await clientesAPI.getAll();
        if (isMounted && Array.isArray(data)) {
          setClientes(data);
        }
      } catch (err) {
        console.error('Error cargando clientes:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchClientes();
    return () => { isMounted = false; };
  }, []);

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

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm bg-white rounded-2xl border border-slate-200">
          <Loader2 size={22} className="animate-spin text-brand-600" />
          Cargando clientes de la base de datos...
        </div>
      ) : clientes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <Users size={36} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No hay clientes registrados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Los clientes que agenden horas o sean agregados manualmente aparecerán listados aquí.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clientes.map((cliente) => (
            <div key={cliente.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
                  <Users size={22} />
                </div>
                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs font-semibold">
                  Activo
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{cliente.nombre} {cliente.apellido || ''}</h2>
              <p className="mt-1 text-xs text-slate-500 font-medium">RUT: {cliente.rut || 'Sin RUT'}</p>

              <div className="mt-5 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-brand-600 shrink-0" />
                  <span className="truncate">{cliente.email || 'Sin correo'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-brand-600 shrink-0" />
                  <span>{cliente.telefono || 'Sin teléfono'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

