import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, ArrowLeft, Loader2 } from 'lucide-react';
import { catalogoAPI } from '../services/api';

const initialForm = {
  nombre: '',
  categoria: 'Mantenimiento',
  descripcion: '',
  precio_unitario: 0,
  tiempo_minutos: 30,
  marca: 'Multimarca',
  tipo: 'servicio',
};

export default function NuevoServicioPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await catalogoAPI.create({
        nombre: form.nombre,
        descripcion: form.descripcion,
        categoria: form.categoria,
        marca: form.marca || null,
        tipo: form.tipo,
        precio_unitario: Number(form.precio_unitario),
        tiempo_minutos: Number(form.tiempo_minutos),
      });
      navigate('/catalogo');
    } catch (err) {
      console.error('Error guardando servicio:', err);
      setError(err.response?.data?.message || 'Error al guardar el servicio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">Catálogo</p>
          <h1 className="text-3xl font-bold text-slate-900">Nuevo servicio</h1>
        </div>

        <button
          type="button"
          onClick={() => navigate('/catalogo')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
            <span>Nombre del servicio</span>
            <input name="nombre" value={form.nombre} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Categoría</span>
            <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm">
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Filtro">Filtro</option>
              <option value="Fluidos">Fluidos</option>
              <option value="Preventivo">Preventivo</option>
              <option value="Motor">Motor</option>
            </select>
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Tipo</span>
            <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm">
              <option value="servicio">Servicio</option>
              <option value="producto">Producto</option>
              <option value="revision">Revisión</option>
            </select>
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Marca</span>
            <input name="marca" value={form.marca} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Precio unitario ($)</span>
            <input name="precio_unitario" type="number" value={form.precio_unitario} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Tiempo estimado (minutos)</span>
            <input name="tiempo_minutos" type="number" value={form.tiempo_minutos} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
            <span>Descripción</span>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="4" required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>
        </div>

        <button type="submit" disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-bold text-white transition hover:bg-brand-700 disabled:opacity-70 text-sm shadow-md shadow-brand-600/20 cursor-pointer">
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <PackagePlus size={18} />
              Guardar servicio
            </>
          )}
        </button>
      </form>
    </div>
  );
}
