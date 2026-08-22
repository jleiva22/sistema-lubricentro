import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, BadgeDollarSign } from 'lucide-react';
import { clientesData, vehiculosData, catalogoData } from '../data/mockData';

const today = new Date().toISOString().slice(0, 10);

const initialForm = {
  clienteId: clientesData[0]?.id ?? 1,
  vehiculoId: vehiculosData[0]?.id ?? 1,
  fechaIngreso: today,
  diagnostico: 'Cambio de aceite y revisión preventiva general.',
  incluirIva: true,
  selectedServiceIds: [1, 4],
};

export default function NuevaOrdenPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);

  const cliente = clientesData.find((item) => item.id === Number(form.clienteId)) ?? clientesData[0];
  const vehiculo = vehiculosData.find((item) => item.id === Number(form.vehiculoId)) ?? vehiculosData[0];

  const serviciosSeleccionados = useMemo(
    () => catalogoData.filter((servicio) => form.selectedServiceIds.includes(servicio.id)),
    [form.selectedServiceIds]
  );

  const subtotal = serviciosSeleccionados.reduce((sum, servicio) => sum + Number(servicio.precio), 0);
  const iva = form.incluirIva ? subtotal * 0.19 : 0;
  const total = subtotal + iva;

  const toggleServicio = (id) => {
    setForm((prev) => {
      const exists = prev.selectedServiceIds.includes(id);
      return {
        ...prev,
        selectedServiceIds: exists
          ? prev.selectedServiceIds.filter((item) => item !== id)
          : [...prev.selectedServiceIds, id],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      cliente,
      vehiculo,
      fechaIngreso: form.fechaIngreso,
      diagnostico: form.diagnostico,
      servicios: serviciosSeleccionados,
      subtotal,
      iva,
      total,
      incluirIva: form.incluirIva,
    };

    navigate('/boletas/preview', { state: payload });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">Gestión</p>
          <h1 className="text-3xl font-bold text-slate-900">Nueva orden de trabajo</h1>
        </div>

        <Link
          to="/ordenes"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Volver a órdenes
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Datos del vehículo</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                <span>Cliente</span>
                <select
                  value={form.clienteId}
                  onChange={(e) => setForm((prev) => ({ ...prev, clienteId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none"
                >
                  {clientesData.map((item) => (
                    <option key={item.id} value={item.id}>{item.nombre} {item.apellido}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                <span>Vehículo</span>
                <select
                  value={form.vehiculoId}
                  onChange={(e) => setForm((prev) => ({ ...prev, vehiculoId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none"
                >
                  {vehiculosData.map((item) => (
                    <option key={item.id} value={item.id}>{item.marca} {item.modelo} - {item.patente}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                <span>Fecha de ingreso</span>
                <input
                  type="date"
                  value={form.fechaIngreso}
                  onChange={(e) => setForm((prev) => ({ ...prev, fechaIngreso: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none"
                />
              </label>

              <div className="rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs text-brand-800 flex flex-col justify-center">
                <div className="font-bold">Tiempo estimado de atención</div>
                <div className="mt-0.5 text-brand-700">30 min aprox. / 1 hora si incluye servicio adicional</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Diagnóstico y servicios</h2>

            <label className="mb-5 block space-y-1.5 text-sm font-semibold text-slate-700">
              <span>Fallas detectadas / observaciones</span>
              <textarea
                rows="3"
                value={form.diagnostico}
                onChange={(e) => setForm((prev) => ({ ...prev, diagnostico: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal placeholder:text-slate-400 focus:border-brand-600 focus:outline-none text-xs"
                placeholder="Ej: Motor con ruido leve, requiere cambio de aceite y revisión de filtros."
              />
            </label>

            <div className="space-y-3">
              {catalogoData.map((servicio) => {
                const checked = form.selectedServiceIds.includes(servicio.id);

                return (
                  <button
                    key={servicio.id}
                    type="button"
                    onClick={() => toggleServicio(servicio.id)}
                    className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition ${
                      checked
                        ? 'border-brand-500 bg-brand-50/80 text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{servicio.nombre}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{servicio.descripcion}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-brand-600 text-sm">${servicio.precio.toLocaleString('es-CL')}</span>
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold ${checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white'}`}>
                        {checked ? '✓' : ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Resumen</h2>

            <div className="space-y-2">
              {serviciosSeleccionados.length === 0 ? (
                <p className="text-xs text-slate-500">No hay servicios seleccionados.</p>
              ) : (
                serviciosSeleccionados.map((servicio) => (
                  <div key={servicio.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{servicio.nombre}</p>
                      <p className="text-[11px] text-slate-500">{servicio.tiempoEstimado}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-600">${servicio.precio.toLocaleString('es-CL')}</span>
                      <button
                        type="button"
                        onClick={() => toggleServicio(servicio.id)}
                        className="text-red-500 hover:text-red-700 transition p-1 cursor-pointer"
                        aria-label={`Eliminar ${servicio.nombre}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">${subtotal.toLocaleString('es-CL')}</span>
              </div>

              <label className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 border border-slate-200 cursor-pointer">
                <span>¿Incluir IVA (19%)?</span>
                <input
                  checked={form.incluirIva}
                  onChange={(e) => setForm((prev) => ({ ...prev, incluirIva: e.target.checked }))}
                  type="checkbox"
                  className="h-4 w-4 accent-brand-600 cursor-pointer"
                />
              </label>

              <div className="flex items-center justify-between text-slate-500">
                <span>IVA (19%)</span>
                <span>${iva.toLocaleString('es-CL')}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-900">
                <span>Total</span>
                <span className="text-emerald-600 text-lg">${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-bold text-white transition hover:bg-brand-700 shadow-md shadow-brand-600/20 text-sm cursor-pointer"
            >
              <BadgeDollarSign size={18} />
              Pagar e imprimir boleta
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
