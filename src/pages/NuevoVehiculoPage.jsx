import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarFront, ArrowLeft } from 'lucide-react';
import mockAPI from '../services/mockBackend';

const initialForm = {
  clienteId: 1,
  patente: '',
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  tipoMotor: 'Gasolina',
  kilometraje: 0,
  ultimoServicio: new Date().toISOString().slice(0, 10),
};

export default function NuevoVehiculoPage() {
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
      mockAPI.vehiculos.create(form);
      navigate('/vehiculos');
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

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>ID Cliente</span>
            <input name="clienteId" type="number" value={form.clienteId} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Patente</span>
            <input name="patente" value={form.patente} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm uppercase" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Marca</span>
            <input name="marca" value={form.marca} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Modelo</span>
            <input name="modelo" value={form.modelo} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Año</span>
            <input name="anio" type="number" value={form.anio} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Tipo de motor</span>
            <select name="tipoMotor" value={form.tipoMotor} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm">
              <option value="Gasolina">Gasolina</option>
              <option value="Diésel">Diésel</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Eléctrico">Eléctrico</option>
            </select>
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Kilometraje</span>
            <input name="kilometraje" type="number" value={form.kilometraje} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Último servicio</span>
            <input name="ultimoServicio" type="date" value={form.ultimoServicio} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>
        </div>

        <button type="submit" disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-bold text-white transition hover:bg-brand-700 disabled:opacity-70 text-sm shadow-md shadow-brand-600/20 cursor-pointer">
          <CarFront size={18} />
          {saving ? 'Guardando...' : 'Guardar vehículo'}
        </button>
      </form>
    </div>
  );
}
