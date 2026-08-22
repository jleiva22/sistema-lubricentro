import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import mockAPI from '../services/mockBackend';

const initialForm = {
  nombre: '',
  apellido: '',
  rut: '',
  telefono: '',
  email: '',
};

export default function NuevoClientePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      mockAPI.clientes.create(form);
      navigate('/clientes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">CRM</p>
          <h1 className="text-3xl font-bold text-slate-900">Nuevo cliente</h1>
        </div>

        <button
          type="button"
          onClick={() => navigate('/clientes')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Nombre</span>
            <input name="nombre" value={form.nombre} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Apellido</span>
            <input name="apellido" value={form.apellido} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>RUT</span>
            <input name="rut" value={form.rut} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Teléfono</span>
            <input name="telefono" value={form.telefono} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
            <span>Correo electrónico</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>
        </div>

        <button type="submit" disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-bold text-white transition hover:bg-brand-700 disabled:opacity-70 text-sm shadow-md shadow-brand-600/20 cursor-pointer">
          <UserPlus size={18} />
          {saving ? 'Guardando...' : 'Guardar cliente'}
        </button>
      </form>
    </div>
  );
}
