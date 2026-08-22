import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Loader2 } from 'lucide-react';
import { vehiculosAPI } from '../services/api';

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchVehiculos = async () => {
      try {
        const { data } = await vehiculosAPI.getAll();
        if (isMounted && Array.isArray(data)) {
          setVehiculos(data);
        }
      } catch (err) {
        console.error('Error cargando vehículos:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchVehiculos();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">Inventario</p>
          <h1 className="text-3xl font-bold text-slate-900">Vehículos</h1>
        </div>
        <Link to="/vehiculos/nuevo" className="rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 shadow-md shadow-brand-600/20 text-sm">
          Nuevo vehículo
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm bg-white rounded-2xl border border-slate-200">
          <Loader2 size={22} className="animate-spin text-brand-600" />
          Cargando vehículos...
        </div>
      ) : vehiculos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <Car size={36} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No hay vehículos registrados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Los vehículos asociados a clientes u órdenes ingresadas aparecerán listados aquí.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="px-4 py-3 font-semibold">Patente</th>
                <th className="px-4 py-3 font-semibold">Marca</th>
                <th className="px-4 py-3 font-semibold">Modelo</th>
                <th className="px-4 py-3 font-semibold">Año</th>
                <th className="px-4 py-3 font-semibold">Motor</th>
                <th className="px-4 py-3 font-semibold">Kilometraje</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((vehiculo) => (
                <tr key={vehiculo.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50">
                  <td className="px-4 py-4 font-bold text-brand-600 font-mono">{vehiculo.patente}</td>
                  <td className="px-4 py-4 font-medium text-slate-900">{vehiculo.marca}</td>
                  <td className="px-4 py-4">{vehiculo.modelo}</td>
                  <td className="px-4 py-4">{vehiculo.anio || '-'}</td>
                  <td className="px-4 py-4">{vehiculo.tipo_motor || 'Gasolina'}</td>
                  <td className="px-4 py-4 font-bold text-slate-900">
                    {Number(vehiculo.kilometraje_actual || 0).toLocaleString('es-CL')} km
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
            <Car size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recomendación de servicio</h2>
            <p className="text-xs text-slate-500">Se recomienda revisar el cambio de aceite según tipo de motor y kilometraje.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-amber-700">Mineral</p>
            <p className="mt-1 text-2xl font-black text-slate-900">5.000 km</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-sky-700">Semisintético</p>
            <p className="mt-1 text-2xl font-black text-slate-900">10.000 km</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-emerald-700">Sintético</p>
            <p className="mt-1 text-2xl font-black text-slate-900">10.000 - 15.000 km</p>
          </div>
        </div>
      </div>
    </div>
  );
}

