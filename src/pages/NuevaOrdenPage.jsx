import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BadgeDollarSign, Loader2, Search, X, Droplet, Wrench } from 'lucide-react';
import { clientesAPI, vehiculosAPI, catalogoAPI, ordenesAPI } from '../services/api';
import { useAuth } from '../context/useAuth';

const today = new Date().toISOString().slice(0, 10);

export default function NuevaOrdenPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [allVehiculos, setAllVehiculos] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [servicioSearch, setServicioSearch] = useState('');

  const isCliente = user?.rol === 'cliente';
  const preselectedIds = location.state?.preselectedServiceIds || [];

  const [form, setForm] = useState({
    clienteId: '',
    vehiculoId: '',
    fechaIngreso: today,
    diagnostico: 'Cambio de aceite y revisión preventiva general.',
    incluirIva: true,
    selectedServiceIds: preselectedIds,
  });

  // Carga de datos iniciales
  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      try {
        const [resClientes, resVehiculos, resCatalogo] = await Promise.all([
          isCliente ? Promise.resolve({ data: [] }) : clientesAPI.getAll().catch(() => ({ data: [] })),
          vehiculosAPI.getAll().catch(() => ({ data: [] })),
          catalogoAPI.getAll().catch(() => ({ data: [] })),
        ]);

        if (isMounted) {
          const cliList = resClientes.data || [];
          const vehList = resVehiculos.data || [];
          const catList = resCatalogo.data || [];

          setClientes(cliList);
          setAllVehiculos(vehList);
          setCatalogo(catList);

          setForm((prev) => ({
            ...prev,
            clienteId: cliList[0]?.id || '',
            selectedServiceIds: prev.selectedServiceIds.length > 0
              ? prev.selectedServiceIds
              : (catList[0]?.id ? [catList[0].id] : []),
          }));
        }
      } catch (err) {
        console.error('Error cargando datos para la orden:', err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };

    fetchAllData();
    return () => { isMounted = false; };
  }, [isCliente]);

  // Filtrado de vehículos según cliente seleccionado
  const vehiculosFiltrados = useMemo(() => {
    if (isCliente) return allVehiculos;
    if (!form.clienteId) return allVehiculos;
    return allVehiculos.filter(v => Number(v.cliente_id) === Number(form.clienteId));
  }, [allVehiculos, form.clienteId, isCliente]);

  useEffect(() => {
    setForm(prev => ({ ...prev, vehiculoId: vehiculosFiltrados[0]?.id || '' }));
  }, [vehiculosFiltrados]);

  const cliente = clientes.find((item) => String(item.id) === String(form.clienteId)) || clientes[0];
  const vehiculo = allVehiculos.find((item) => String(item.id) === String(form.vehiculoId)) || vehiculosFiltrados[0];

  // Clasificación de Servicios: Principales (Aceites/Lubricantes) vs Adicionales
  const serviciosPrincipales = useMemo(() => {
    return catalogo.filter((s) => {
      const cat = (s.categoria || '').toLowerCase();
      const nom = (s.nombre || '').toLowerCase();
      return cat.includes('aceite') || cat.includes('lubricant') || nom.includes('aceite') || nom.includes('lubricat');
    });
  }, [catalogo]);

  const serviciosAdicionales = useMemo(() => {
    const q = servicioSearch.toLowerCase();
    return catalogo.filter((s) => {
      const cat = (s.categoria || '').toLowerCase();
      const nom = (s.nombre || '').toLowerCase();
      const esPrincipal = cat.includes('aceite') || cat.includes('lubricant') || nom.includes('aceite') || nom.includes('lubricat');

      if (esPrincipal) return false;
      if (!servicioSearch) return true;

      return (
        nom.includes(q) ||
        (s.descripcion || '').toLowerCase().includes(q) ||
        cat.includes(q)
      );
    });
  }, [catalogo, servicioSearch]);

  const serviciosSeleccionados = useMemo(
    () => catalogo.filter((servicio) => form.selectedServiceIds.includes(servicio.id)),
    [catalogo, form.selectedServiceIds]
  );

  // Totales acumulados
  const subtotal = serviciosSeleccionados.reduce((sum, servicio) => sum + Number(servicio.precio_unitario ?? servicio.precio_base ?? 0), 0);
  const iva = form.incluirIva ? subtotal * 0.19 : 0;
  const total = subtotal + iva;
  const tiempoEstimado = serviciosSeleccionados.reduce((sum, servicio) => sum + Number(servicio.tiempo_minutos ?? servicio.duracion_estimada ?? 30), 0);

  // SELECCIÓN EXCLUSIVA (Solo 1 Servicio Principal de Cambio de Aceite)
  const handleSelectPrincipal = (id) => {
    setForm((prev) => {
      const principalIds = serviciosPrincipales.map((s) => s.id);
      // Mantener los adicionales previamente seleccionados
      const adicionalesSeleccionados = prev.selectedServiceIds.filter(
        (selectedId) => !principalIds.includes(selectedId)
      );

      const yaEstabaSeleccionado = prev.selectedServiceIds.includes(id);

      return {
        ...prev,
        selectedServiceIds: yaEstabaSeleccionado
          ? adicionalesSeleccionados // Permite desmarcarlo si vuelve a hacer clic
          : [...adicionalesSeleccionados, id], // Reemplaza el aceite anterior por el nuevo
      };
    });
  };

  // SELECCIÓN MÚLTIPLE (Servicios Adicionales)
  const toggleServicioAdicional = (id) => {
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
      let res;

      if (isCliente) {
        const payload = {
          vehiculo_id: Number(form.vehiculoId),
          fecha_programada: form.fechaIngreso,
          observaciones_fallas: form.diagnostico,
          servicio_ids: form.selectedServiceIds,
        };
        res = await ordenesAPI.createOrdenCliente(payload);
      } else {
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
        res = await ordenesAPI.create(payload);
      }

      const createdOrder = res.data?.data || res.data;

      const previewState = {
        cliente: isCliente ? { nombre: user.nombre, apellido: user.apellido } : cliente,
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
          <h1 className="text-3xl font-bold text-slate-900">
            {isCliente ? 'Solicitar servicio' : 'Nueva orden de trabajo'}
          </h1>
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
          {/* Datos del vehículo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Datos del vehículo</h2>

            <div className="grid gap-4 md:grid-cols-2">
              {!isCliente && (
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
              )}

              <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                <span>{isCliente ? 'Mi vehículo' : 'Vehículo'}</span>
                <select
                  value={form.vehiculoId}
                  onChange={(e) => setForm((prev) => ({ ...prev, vehiculoId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none"
                >
                  {vehiculosFiltrados.length === 0 ? (
                    <option value="">Sin vehículos registrados para este cliente</option>
                  ) : (
                    vehiculosFiltrados.map((item) => (
                      <option key={item.id} value={item.id}>{item.marca} {item.modelo} - {item.patente}</option>
                    ))
                  )}
                </select>
              </label>

              <label className="space-y-1.5 text-sm font-semibold text-slate-700">
                <span>Fecha programada</span>
                <input
                  type="date"
                  value={form.fechaIngreso}
                  onChange={(e) => setForm((prev) => ({ ...prev, fechaIngreso: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none"
                />
              </label>

              <div className="rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-xs text-brand-800 flex flex-col justify-center">
                <div className="font-bold">Tiempo estimado de atención</div>
                <div className="mt-0.5 text-brand-700">{tiempoEstimado || 30} minutos aprox.</div>
              </div>
            </div>
          </div>

          {/* Bloque 1: Servicio Principal - Cambio de Aceite (SELECCIÓN ÚNICA) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Droplet size={20} className="text-brand-600" />
                  1. Servicio Principal (Cambio de Aceite)
                </h2>
                <p className="text-xs text-slate-500">Selecciona el lubricante principal (Solo puedes elegir 1)</p>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700 border border-brand-200">
                Selecciona 1
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {serviciosPrincipales.length === 0 ? (
                <div className="col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  No se encontraron servicios de cambio de aceite en el catálogo.
                </div>
              ) : (
                serviciosPrincipales.map((servicio) => {
                  const checked = form.selectedServiceIds.includes(servicio.id);
                  const precio = Number(servicio.precio_unitario ?? servicio.precio_base ?? 0);
                  const tiempo = Number(servicio.tiempo_minutos ?? servicio.duracion_estimada ?? 30);

                  return (
                    <button
                      key={servicio.id}
                      type="button"
                      onClick={() => handleSelectPrincipal(servicio.id)}
                      className={`flex flex-col justify-between rounded-xl border p-4 text-left transition cursor-pointer ${
                        checked
                          ? 'border-brand-500 bg-brand-50/80 text-slate-900 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">
                            {servicio.marca || 'Aceite Motor'}
                          </span>
                          <h3 className="font-bold text-sm text-slate-900 mt-0.5">{servicio.nombre}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{servicio.descripcion}</p>
                        </div>
                        {/* Radio visual para indicar opción única */}
                        <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white'}`}>
                          {checked ? '✓' : ''}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-2.5 text-xs">
                        <span className="text-slate-500 font-medium">{tiempo} min</span>
                        <span className="font-bold text-slate-900 text-sm">${precio.toLocaleString('es-CL')}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Bloque 2: Servicios Adicionales & Revisiones (SELECCIÓN MÚLTIPLE) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Wrench size={20} className="text-slate-700" />
                  2. Servicios Adicionales & Revisiones
                </h2>
                <p className="text-xs text-slate-500">Agrega revisiones opcionales (Puedes seleccionar varias)</p>
              </div>
            </div>

            {/* Buscador de adicionales */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500">
              <Search size={16} />
              <input
                type="text"
                value={servicioSearch}
                onChange={(e) => setServicioSearch(e.target.value)}
                placeholder="Buscar revisión, neumáticos, sapito..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {servicioSearch && (
                <button type="button" onClick={() => setServicioSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {serviciosAdicionales.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  {servicioSearch ? 'No se encontraron servicios adicionales con esa búsqueda.' : 'No hay servicios adicionales configurados.'}
                </p>
              ) : (
                serviciosAdicionales.map((servicio) => {
                  const checked = form.selectedServiceIds.includes(servicio.id);
                  const precio = Number(servicio.precio_unitario ?? servicio.precio_base ?? 0);
                  const tiempo = Number(servicio.tiempo_minutos ?? servicio.duracion_estimada ?? 15);

                  return (
                    <button
                      key={servicio.id}
                      type="button"
                      onClick={() => toggleServicioAdicional(servicio.id)}
                      className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition cursor-pointer ${
                        checked
                          ? 'border-brand-500 bg-brand-50/80 text-slate-900'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white'}`}>
                          {checked ? '✓' : ''}
                        </span>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{servicio.nombre}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{servicio.descripcion || 'Revisión complementaria'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-slate-500 font-medium">{tiempo} min</span>
                        <span className="font-bold text-slate-900 text-xs">${precio.toLocaleString('es-CL')}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Diagnóstico u Observaciones */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="mb-2 text-lg font-bold text-slate-900">Observaciones técnicas</h2>
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              <span className="text-xs text-slate-500 font-normal">Indica ruidos, fallas reportadas por el cliente o sugerencias de revisión</span>
              <textarea
                rows="3"
                value={form.diagnostico}
                onChange={(e) => setForm((prev) => ({ ...prev, diagnostico: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal placeholder:text-slate-400 focus:border-brand-600 focus:outline-none text-xs"
                placeholder="Ej: Revisar presión de neumáticos, nivel de agua del sapito y solicitar alineación si corresponde."
              />
            </label>
          </div>
        </div>

        {/* Panel Lateral — Resumen de la Orden */}
        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Resumen del servicio</h2>

            <div className="space-y-3 text-sm text-slate-700 max-h-[300px] overflow-y-auto pr-1">
              {serviciosSeleccionados.length === 0 ? (
                <p className="text-xs text-slate-500">Selecciona al menos un servicio.</p>
              ) : (
                serviciosSeleccionados.map((servicio) => {
                  const precio = Number(servicio.precio_unitario ?? servicio.precio_base ?? 0);
                  const esPrincipal = serviciosPrincipales.some((s) => s.id === servicio.id);

                  return (
                    <div key={servicio.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 border border-slate-200">
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          {esPrincipal && <span className="h-1.5 w-1.5 rounded-full bg-brand-600 shrink-0"></span>}
                          {servicio.nombre}
                        </div>
                        <span className="text-[10px] text-slate-500">{esPrincipal ? 'Servicio Principal' : 'Adicional'}</span>
                      </div>
                      <span className="font-bold text-brand-600 text-xs">${precio.toLocaleString('es-CL')}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Subtotal Neto</span>
                <span className="font-semibold">${subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>IVA (19%)</span>
                <span className="font-semibold">${Math.round(iva).toLocaleString('es-CL')}</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Total Estimado</span>
                <span className="text-brand-600">${Math.round(total).toLocaleString('es-CL')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingOrder || loadingData}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 shadow-md shadow-brand-600/20 disabled:opacity-60 cursor-pointer"
            >
              {submittingOrder ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <BadgeDollarSign size={18} />
                  {isCliente ? 'Solicitar servicio' : 'Crear orden'}
                </>
              )}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}