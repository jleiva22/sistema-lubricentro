import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, BadgeDollarSign, Loader2 } from 'lucide-react';
import { clientesAPI, vehiculosAPI, catalogoAPI, ordenesAPI } from '../services/api';

const today = new Date().toISOString().slice(0, 10);

export default function NuevaOrdenPage() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    clienteId: '',
    vehiculoId: '',
    fechaIngreso: today,
    diagnostico: 'Cambio de aceite y revisión preventiva general.',
    incluirIva: true,
    selectedServiceIds: [],
  });

  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      try {
        const [resClientes, resVehiculos, resCatalogo] = await Promise.all([
          clientesAPI.getAll().catch(() => ({ data: [] })),
          vehiculosAPI.getAll().catch(() => ({ data: [] })),
          catalogoAPI.getAll().catch(() => ({ data: [] })),
        ]);

        if (isMounted) {
          const cliList = resClientes.data || [];
          const vehList = resVehiculos.data || [];
          const catList = resCatalogo.data || [];

          setClientes(cliList);
          setVehiculos(vehList);
          setCatalogo(catList);

          setForm((prev) => ({
            ...prev,
            clienteId: cliList[0]?.id || '',
            vehiculoId: vehList[0]?.id || '',
            selectedServiceIds: catList[0]?.id ? [catList[0].id] : [],
          }));
        }
      } catch (err) {
        console.error('Error fetching dynamic order form data:', err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };

    fetchAllData();
    return () => { isMounted = false; };
  }, []);

  const cliente = clientes.find((item) => String(item.id) === String(form.clienteId)) || clientes[0];
  const vehiculo = vehiculos.find((item) => String(item.id) === String(form.vehiculoId)) || vehiculos[0];

  const serviciosSeleccionados = useMemo(
    () => catalogo.filter((servicio) => form.selectedServiceIds.includes(servicio.id)),
    [catalogo, form.selectedServiceIds]
  );

  const subtotal = serviciosSeleccionados.reduce((sum, servicio) => sum + Number(servicio.precio_unitario ?? servicio.precio_base ?? 0), 0);
  const iva = form.incluirIva ? subtotal * 0.19 : 0;
  const total = subtotal + iva;
  const tiempoEstimado = serviciosSeleccionados.reduce((sum, servicio) => sum + Number(servicio.tiempo_minutos ?? servicio.duracion_estimada ?? 30), 0);

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

  const [submittingOrder, setSubmittingOrder] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.vehiculoId) {
      alert('Debes seleccionar un vehículo');
      return;
    }
    if (serviciosSeleccionados.length === 0) {
      alert('Debes seleccionar al menos un servicio del catálogo');
      return;
    }

    setSubmittingOrder(true);
    try {
      const payload = {
        vehiculo_id: Number(form.vehiculoId),
        kilometraje_ingreso: Number(vehiculo?.kilometraje_actual || 0),
        fecha_programada: form.fechaIngreso,
        observaciones_fallas: form.diagnostico,
        detalles: serviciosSeleccionados.map((s) => ({
          servicio_id: s.id,
          cantidad: 1,
          precio_unitario: Number(s.precio_unitario ?? s.precio_base ?? 0),
        })),
      };

      const res = await ordenesAPI.create(payload);
      const createdOrder = res.data?.data || res.data;

      const previewState = {
        cliente,
        vehiculo,
        fechaIngreso: form.fechaIngreso,
        diagnostico: form.diagnostico,
        servicios: serviciosSeleccionados.map((servicio) => ({
          id: servicio.id,
          nombre: servicio.nombre,
          marca: servicio.marca,
          tiempoEstimado: `${Number(servicio.tiempo_minutos ?? servicio.duracion_estimada ?? 30)} min`,
          precio: Number(servicio.precio_unitario ?? servicio.precio_base ?? 0),
        })),
        subtotal,
        iva,
        total,
        incluirIva: form.incluirIva,
        ordenId: createdOrder?.id,
      };

      navigate('/boletas/preview', { state: previewState });
    } catch (err) {
      alert('Error al guardar orden: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingOrder(false);
    }
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
                  {clientes.length === 0 ? (
                    <option value="">Sin clientes en la BD</option>
                  ) : (
                    clientes.map((item) => (
                      <option key={item.id} value={item.id}>{item.nombre} {item.apellido || ''}</option>
                    ))
                  )}
                </select>
              </label>

              <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                <span>Vehículo</span>
                <select
                  value={form.vehiculoId}
                  onChange={(e) => setForm((prev) => ({ ...prev, vehiculoId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none"
                >
                  {vehiculos.length === 0 ? (
                    <option value="">Sin vehículos en la BD</option>
                  ) : (
                    vehiculos.map((item) => (
                      <option key={item.id} value={item.id}>{item.marca} {item.modelo} - {item.patente}</option>
                    ))
                  )}
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
                <div className="mt-0.5 text-brand-700">{tiempoEstimado || 30} minutos aprox. / 1 hora si incluye otro servicio adicional</div>
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
              {catalogo.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No hay servicios en el catálogo.</p>
              ) : (
                catalogo.map((servicio) => {
                  const checked = form.selectedServiceIds.includes(servicio.id);
                  const precio = Number(servicio.precio_unitario ?? servicio.precio_base ?? 0);
                  const tiempo = Number(servicio.tiempo_minutos ?? servicio.duracion_estimada ?? 30);

                  return (
                    <button
                      key={servicio.id}
                      type="button"
                      onClick={() => toggleServicio(servicio.id)}
                      className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition ${checked
                          ? 'border-brand-500 bg-brand-50/80 text-slate-900'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">{servicio.nombre}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{servicio.descripcion}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-brand-600 text-sm">${precio.toLocaleString('es-CL')}</span>
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs font-bold ${checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white'}`}>
                          {checked ? '✓' : ''}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Resumen</h2>

            <div className="space-y-3 text-sm text-slate-700">
              {serviciosSeleccionados.length === 0 ? (
                <p className="text-xs text-slate-500">Aún no has seleccionado servicios.</p>
              ) : (
                serviciosSeleccionados.map((servicio) => {
                  const precio = Number(servicio.precio_unitario ?? servicio.precio_base ?? 0);
                  return (
                    <div key={servicio.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 border border-slate-200">
                      <span className="text-xs font-medium text-slate-700">{servicio.nombre}</span>
                      <span className="font-bold text-brand-600 text-xs">${precio.toLocaleString('es-CL')}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">${subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>IVA</span>
                <span className="font-semibold">${iva.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-slate-900">
                <span>Total</span>
                <span className="text-brand-600">${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingOrder || loadingData}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 shadow-md shadow-brand-600/20 disabled:opacity-60"
            >
              {submittingOrder ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <BadgeDollarSign size={18} />
                  Crear orden
                </>
              )}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
