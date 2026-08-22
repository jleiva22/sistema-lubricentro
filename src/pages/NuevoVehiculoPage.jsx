import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarFront, ArrowLeft } from 'lucide-react';
import { vehiculosAPI } from '../services/api';

const initialForm = {
  cliente_id: 1, // Se mantiene interno sin mostrarse en el formulario
  patente: '',
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  tipo_motor: 'Gasolina',
  kilometraje_actual: 0,
};

export default function NuevoVehiculoPage() {
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
      await vehiculosAPI.create(form);
      navigate('/vehiculos');
    } catch (err) {
      console.error('Error guardando vehículo:', err);
      setError(err.response?.data?.message || 'Error al guardar el vehículo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">Inventario</p>
          <h1 className="text-3xl font-bold text-slate-900">Nuevo vehículo</h1>
        </div>

        <button
          type="button"
          onClick={() => navigate('/vehiculos')}
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
          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Patente</span>
            <input
              name="patente"
              value={form.patente}
              onChange={handleChange}
              placeholder="AABB11"
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm uppercase"
            />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Marca</span>
            <input
              name="marca"
              value={form.marca}
              onChange={handleChange}
              placeholder="Ej: Toyota"
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm"
            />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Modelo</span>
            <input
              name="modelo"
              value={form.modelo}
              onChange={handleChange}
              placeholder="Ej: Yaris"
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm"
            />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Año</span>
            <input
              name="anio"
              type="number"
              value={form.anio}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm"
            />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Tipo de motor</span>
            <select
              name="tipo_motor"
              value={form.tipo_motor}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm"
            >
              <option value="Gasolina">Gasolina</option>
              <option value="Diésel">Diésel</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Eléctrico">Eléctrico</option>
            </select>
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Kilometraje actual</span>
            <input
              name="kilometraje_actual"
              type="number"
              value={form.kilometraje_actual}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-bold text-white transition hover:bg-brand-700 disabled:opacity-70 text-sm shadow-md shadow-brand-600/20 cursor-pointer"
        >
          <CarFront size={18} />
          {saving ? 'Guardando...' : 'Guardar vehículo'}
        </button>
      </form>
    </div>
  );
}