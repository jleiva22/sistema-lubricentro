import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarFront, ArrowLeft, Loader2 } from 'lucide-react';
import { vehiculosAPI, clientesAPI } from '../services/api';
import { useAuth } from '../context/useAuth';

export default function NuevoVehiculoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);

  const isCliente = user?.rol === 'cliente';
  const isAdmin = user?.rol === 'administrador';
  const isMecanico = user?.rol === 'mecanico';

  const [form, setForm] = useState({
    cliente_id: '',
    patente: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    tipo_motor: 'Gasolina',
    kilometraje_actual: '',
  });

  // Fetch clients list for admin/mechanic
  useEffect(() => {
    if (isCliente) return;
    const fetchClientes = async () => {
      try {
        const { data } = await clientesAPI.getAll();
        if (Array.isArray(data)) {
          setClientes(data);
          if (data.length > 0) {
            setForm(prev => ({ ...prev, cliente_id: data[0].id }));
          }
        }
      } catch (err) {
        console.error('Error cargando clientes:', err);
      }
    };
    fetchClientes();
  }, [isCliente]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        patente: form.patente,
        marca: form.marca,
        modelo: form.modelo,
        anio: Number(form.anio),
        tipo_motor: form.tipo_motor,
        kilometraje_actual: Number(form.kilometraje_actual) || 0,
      };

      // Only include cliente_id for admin/mechanic
      if (!isCliente && form.cliente_id) {
        payload.cliente_id = Number(form.cliente_id);
      }

      await vehiculosAPI.create(payload);
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
          {/* Client selector — only for admin/mechanic */}
          {(isAdmin || isMecanico) && (
            <label className="space-y-1.5 text-sm font-semibold text-slate-700 md:col-span-2">
              <span>Asociar a cliente</span>
              <select
                name="cliente_id"
                value={form.cliente_id}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm"
              >
                {clientes.length === 0 ? (
                  <option value="">No hay clientes registrados</option>
                ) : (
                  clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} {c.apellido || ''} — {c.rut || 'Sin RUT'}</option>
                  ))
                )}
              </select>
            </label>
          )}

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
              min="0"
              value={form.kilometraje_actual}
              onChange={handleChange}
              placeholder="Ej: 45000"
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
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CarFront size={18} />
              Guardar vehículo
            </>
          )}
        </button>
      </form>
    </div>
  );
}