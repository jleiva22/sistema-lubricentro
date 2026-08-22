import { Link } from 'react-router-dom';
import { Package, Clock3 } from 'lucide-react';
import { catalogoData } from '../data/mockData';

export default function CatalogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">Catálogo</p>
          <h1 className="text-3xl font-bold text-slate-900">Servicios y productos</h1>
        </div>
        <Link to="/catalogo/nuevo" className="rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 shadow-md shadow-brand-600/20 text-sm">
          Agregar servicio
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {catalogoData.map((servicio) => (
          <div key={servicio.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
                  <Package size={22} />
                </div>
                <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-semibold">
                  {servicio.categoria}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{servicio.nombre}</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{servicio.descripcion}</p>
            </div>

            <div>
              <div className="mt-5 flex items-center justify-between text-xs text-slate-700 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-2 font-medium">
                  <Clock3 size={16} className="text-brand-600" />
                  {servicio.tiempoEstimado}
                </span>
                <span className="text-lg font-black text-brand-600">${servicio.precio.toLocaleString('es-CL')}</span>
              </div>

              <div className="mt-2 text-[11px] font-semibold text-slate-400">Marca: {servicio.marca}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
