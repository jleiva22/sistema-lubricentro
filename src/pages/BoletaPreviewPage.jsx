import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Printer, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { boletasAPI } from '../services/api';

const normalizeBoletaData = (data) => {
  if (!data) return null;

  // Extraer el objeto boleta u orden de la propiedad recibida
  const item = data.boleta || data.orden || data;
  const orden = item.orden || (item.vehiculo ? item : {});
  const vehiculo = orden.vehiculo || item.vehiculo || {};
  const cliente = vehiculo.cliente || orden.cliente || item.cliente || {};

  // Mapear detalles desde BoletaDetalle o DetalleOrden
  const rawDetalles = item.detalles || orden.detalles || item.servicios || [];
  const servicios = rawDetalles.map((det, index) => {
    const cantidad = Number(det.cantidad || 1);
    const precio = Number(det.precio_unitario ?? det.precio ?? 0);
    const subtotal = Number(det.subtotal ?? (precio * cantidad));

    return {
      id: det.id || index,
      nombre: det.nombre_servicio || det.servicio?.nombre || det.nombre || 'Servicio realizado',
      marca: det.servicio?.marca || det.marca || 'Multimarca',
      cantidad,
      precio,
      subtotal,
    };
  });

  const subtotal = Number(item.subtotal ?? servicios.reduce((sum, s) => sum + s.subtotal, 0));
  const iva = Number(item.iva ?? Math.round(subtotal * 0.19));
  const total = Number(item.total ?? (subtotal + iva));

  const fechaRaw = item.fecha_emision || item.createdAt || orden.fecha_ingreso || new Date();
  const fechaFormatted = new Date(fechaRaw).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return {
    id: item.id || orden.id,
    numeroBoleta: item.numero_boleta || `BL-${new Date().getFullYear()}-${String(item.id || orden.id || 1).padStart(6, '0')}`,
    fechaEmision: fechaFormatted,
    cliente: {
      nombre: `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || item.cliente_nombre || 'Cliente General',
      email: cliente.email || 'Sin correo registrado',
      telefono: cliente.telefono || 'Sin teléfono registrado',
    },
    vehiculo: {
      marca: vehiculo.marca || 'N/A',
      modelo: vehiculo.modelo || '',
      patente: vehiculo.patente || 'S/N',
      anio: vehiculo.anio || vehiculo.año || '-',
    },
    servicios,
    subtotal,
    iva,
    total,
    diagnostico: orden.diagnostico || item.diagnostico || 'Servicio finalizado en conformidad.',
  };
};

export default function BoletaPreviewPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const boletaIdParam = searchParams.get('id');

  const [boletaData, setBoletaData] = useState(() => normalizeBoletaData(state));
  const [loading, setLoading] = useState(!boletaData && !!boletaIdParam);

  useEffect(() => {
    // Consulta al backend por ID si no existen datos en el state de React Router
    if (!boletaData && boletaIdParam) {
      let isMounted = true;
      const fetchBoleta = async () => {
        try {
          const res = await boletasAPI.getById(boletaIdParam);
          const data = res.data || res;
          if (isMounted) {
            setBoletaData(normalizeBoletaData(data));
          }
        } catch (err) {
          console.error('Error cargando la boleta por ID:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchBoleta();
      return () => { isMounted = false; };
    }
  }, [boletaIdParam, boletaData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 gap-2 text-sm bg-white rounded-2xl border border-slate-200">
        <Loader2 size={22} className="animate-spin text-brand-600" />
        Cargando datos de la boleta...
      </div>
    );
  }

  const boleta = boletaData || normalizeBoletaData({});

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Barra de navegación e impresión (Oculta al imprimir) */}
      <div className="no-print flex items-center justify-between gap-3 bg-surface-800 p-4 rounded-2xl border border-surface-700">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-surface-600 px-4 py-2.5 text-sm font-medium text-surface-200 transition hover:border-brand-500 hover:text-white cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Boleta lista para impresión
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700 shadow-lg shadow-brand-600/25 cursor-pointer text-sm"
          >
            <Printer size={18} />
            Imprimir Boleta
          </button>
        </div>
      </div>

      {/* Documento Imprimible */}
      <div className="print-area rounded-2xl border border-surface-700 bg-white p-8 text-slate-900 shadow-xl">
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">LUBRIEXPRESS CHILE</h1>
            <p className="mt-1 text-sm font-semibold text-slate-700">RUT Empresa: 76.456.901-2</p>
            <p className="text-xs text-slate-600">Servicios de Mantenimiento Preventivo & Lubricentro</p>
            <p className="text-xs text-slate-600">Av. Alemania 1020, Temuco • Tel: +56 45 221 4455</p>
          </div>

          <div className="text-right bg-slate-100 p-4 rounded-xl border border-slate-300">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Boleta Electrónica</p>
            <p className="text-2xl font-black text-slate-900">{boleta.numeroBoleta}</p>
            <p className="text-xs font-medium text-slate-600 mt-1">Fecha Emisión: {boleta.fechaEmision}</p>
          </div>
        </div>

        {/* Datos Cliente y Vehículo */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Datos del Cliente</p>
            <p className="font-bold text-slate-900 text-base">{boleta.cliente.nombre}</p>
            <p className="text-xs text-slate-700 mt-1">Email: <strong>{boleta.cliente.email}</strong></p>
            <p className="text-xs text-slate-700">Teléfono: <strong>{boleta.cliente.telefono}</strong></p>
          </div>

          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Datos del Vehículo</p>
            <p className="font-bold text-slate-900 text-base">{boleta.vehiculo.marca} {boleta.vehiculo.modelo}</p>
            <p className="text-xs text-slate-700 mt-1">Patente: <strong className="text-slate-900 font-mono bg-slate-200 px-1.5 py-0.5 rounded">{boleta.vehiculo.patente}</strong></p>
            <p className="text-xs text-slate-700 mt-0.5">Año: {boleta.vehiculo.anio}</p>
          </div>
        </div>

        {/* Tabla de Servicios */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">Desglose de Servicios Realizados</p>

          <div className="overflow-hidden rounded-xl border border-slate-300">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Detalle del Servicio / Producto</th>
                  <th className="px-4 py-3 font-semibold">Marca</th>
                  <th className="px-4 py-3 font-semibold text-center">Cant.</th>
                  <th className="px-4 py-3 font-semibold text-right">Monto (CLP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {boleta.servicios.map((servicio) => (
                  <tr key={servicio.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900 font-medium">{servicio.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{servicio.marca}</td>
                    <td className="px-4 py-3 text-center text-slate-700 font-semibold">{servicio.cantidad}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">${servicio.subtotal.toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observaciones / Diagnóstico */}
        <div className="mt-6 rounded-xl bg-slate-100 p-4 border border-slate-200">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">Observaciones Técnicas</p>
          <p className="text-xs text-slate-800 leading-relaxed">{boleta.diagnostico}</p>
        </div>

        {/* Totales */}
        <div className="mt-6 ml-auto max-w-xs space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-300">
          <div className="flex items-center justify-between">
            <span>Subtotal Neto</span>
            <span className="font-semibold">${boleta.subtotal.toLocaleString('es-CL')}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>IVA (19%)</span>
            <span>${boleta.iva.toLocaleString('es-CL')}</span>
          </div>
          <div className="flex items-center justify-between border-t-2 border-slate-900 pt-2 text-base font-black text-slate-900">
            <span>Total Boleta</span>
            <span className="text-emerald-700">${boleta.total.toLocaleString('es-CL')}</span>
          </div>
        </div>

        {/* Pie de página */}
        <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[11px] text-slate-500">
          <p>¡Gracias por su preferencia!</p>
          <p className="font-medium text-slate-700 mt-0.5">LubriExpress Chile • Garantía de Servicio Preventivo</p>
        </div>
      </div>
    </div>
  );
}