import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock3, Loader2, Search, Filter, X, ShoppingCart, Pencil, Trash2, Save } from 'lucide-react';
import { catalogoAPI } from '../services/api';
import { useAuth } from '../context/useAuth';

// ── Modal de edición ──
function EditModal({ servicio, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: servicio.nombre || '',
    descripcion: servicio.descripcion || '',
    categoria: servicio.categoria || 'Mantenimiento',
    tipo: servicio.tipo || 'servicio',
    marca: servicio.marca || '',
    precio_unitario: servicio.precio_unitario || 0,
    tiempo_minutos: servicio.tiempo_minutos || 30,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await catalogoAPI.update(servicio.id, {
        ...form,
        precio_unitario: Number(form.precio_unitario),
        tiempo_minutos: Number(form.tiempo_minutos),
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">Editar servicio</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Nombre</span>
            <input name="nombre" value={form.nombre} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <div className="grid gap-4 grid-cols-2">
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              <span>Categoría</span>
              <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm">
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Filtro">Filtro</option>
                <option value="Fluidos">Fluidos</option>
                <option value="Preventivo">Preventivo</option>
                <option value="Motor">Motor</option>
              </select>
            </label>

            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              <span>Tipo</span>
              <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm">
                <option value="servicio">Servicio</option>
                <option value="producto">Producto</option>
                <option value="revision">Revisión</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              <span>Precio unitario ($)</span>
              <input name="precio_unitario" type="number" value={form.precio_unitario} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
            </label>

            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              <span>Tiempo (min)</span>
              <input name="tiempo_minutos" type="number" value={form.tiempo_minutos} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Marca</span>
            <input name="marca" value={form.marca} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
            <span>Descripción</span>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="3" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 font-normal focus:border-brand-600 focus:outline-none text-sm" />
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition shadow-md shadow-brand-600/20 disabled:opacity-60 cursor-pointer">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Página principal del catálogo ──
export default function CatalogPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [catalogo, setCatalogo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingService, setEditingService] = useState(null);

  const isAdmin = user?.rol === 'administrador';

  const fetchCatalogo = useCallback(async () => {
    try {
      const { data } = await catalogoAPI.getAll();
      if (Array.isArray(data)) {
        setCatalogo(data);
      }
    } catch (err) {
      console.error('Error cargando catálogo:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogo();
  }, [fetchCatalogo]);

  // Categorías y marcas únicas
  const categorias = useMemo(() => {
    const set = new Set(catalogo.map(s => s.categoria || 'Servicio'));
    return [...set].sort();
  }, [catalogo]);

  const marcas = useMemo(() => {
    const set = new Set(catalogo.filter(s => s.marca).map(s => s.marca));
    return [...set].sort();
  }, [catalogo]);

  // Filtrado
  const filtered = useMemo(() => {
    return catalogo.filter((servicio) => {
      const matchSearch = !searchTerm ||
        servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (servicio.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategoria = !filtroCategoria || (servicio.categoria || 'Servicio') === filtroCategoria;
      const matchMarca = !filtroMarca || servicio.marca === filtroMarca;
      return matchSearch && matchCategoria && matchMarca;
    });
  }, [catalogo, searchTerm, filtroCategoria, filtroMarca]);

  const selectedItems = useMemo(() => {
    return catalogo.filter(s => selectedIds.includes(s.id));
  }, [catalogo, selectedIds]);

  const totalSelected = selectedItems.reduce((sum, s) => sum + Number(s.precio_unitario || 0), 0);

  const toggleItem = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFiltroCategoria('');
    setFiltroMarca('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio del catálogo?')) return;
    try {
      await catalogoAPI.delete(id);
      setSelectedIds(prev => prev.filter(i => i !== id));
      await fetchCatalogo();
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditSaved = async () => {
    setEditingService(null);
    await fetchCatalogo();
  };

  const handleCrearOrden = () => {
    // Navegar a crear orden pasando los IDs seleccionados como state
    navigate('/ordenes/nueva', { state: { preselectedServiceIds: selectedIds } });
  };

  const hasActiveFilters = searchTerm || filtroCategoria || filtroMarca;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-600">Catálogo</p>
          <h1 className="text-3xl font-bold text-slate-900">Servicios y productos</h1>
        </div>
        {isAdmin && (
          <Link to="/catalogo/nuevo" className="rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 shadow-md shadow-brand-600/20 text-sm">
            Agregar servicio
          </Link>
        )}
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Buscador */}
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500">
            <Search size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filtro categoría */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-brand-600 focus:outline-none"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filtro marca */}
          {marcas.length > 0 && (
            <select
              value={filtroMarca}
              onChange={(e) => setFiltroMarca(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-brand-600 focus:outline-none"
            >
              <option value="">Todas las marcas</option>
              {marcas.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-100 transition cursor-pointer"
            >
              <X size={14} />
              Limpiar
            </button>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          {filtered.length} de {catalogo.length} items
        </div>
      </div>

      {/* Grid + Side Panel */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Listado de servicios */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm bg-white rounded-2xl border border-slate-200">
              <Loader2 size={22} className="animate-spin text-brand-600" />
              Cargando catálogo...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
              <Package size={36} className="mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-800">
                {hasActiveFilters ? 'No se encontraron resultados' : 'No hay productos ni servicios registrados'}
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-brand-600 font-medium hover:underline cursor-pointer"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filtered.map((servicio) => {
                const precio = Number(servicio.precio_unitario ?? servicio.precio_base ?? 0);
                const tiempo = Number(servicio.tiempo_minutos ?? servicio.duracion_estimada ?? 30);
                const categoria = servicio.categoria || 'Servicio';
                const isSelected = selectedIds.includes(servicio.id);

                return (
                  <div
                    key={servicio.id}
                    className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between text-left transition-all ${
                      isSelected
                        ? 'border-brand-400 bg-brand-50/60 ring-2 ring-brand-200'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(servicio.id)}
                      className="text-left cursor-pointer flex-1"
                    >
                      <div>
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                            isSelected ? 'bg-brand-100 text-brand-600 border-brand-200' : 'bg-brand-50 text-brand-600 border-brand-200'
                          }`}>
                            <Package size={22} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-semibold uppercase">
                              {categoria}
                            </span>
                            {isSelected && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">✓</span>
                            )}
                          </div>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">{servicio.nombre}</h2>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">{servicio.descripcion}</p>
                      </div>

                      <div>
                        <div className="mt-5 flex items-center justify-between text-xs text-slate-700 pt-3 border-t border-slate-100">
                          <span className="inline-flex items-center gap-2 font-medium">
                            <Clock3 size={16} className="text-brand-600" />
                            {tiempo} min
                          </span>
                          <span className="text-lg font-black text-brand-600">${precio.toLocaleString('es-CL')}</span>
                        </div>

                        <div className="mt-2 text-[11px] font-semibold text-slate-400">Marca: {servicio.marca || 'Multimarca'}</div>
                      </div>
                    </button>

                    {/* Admin actions: Edit / Delete */}
                    {isAdmin && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditingService(servicio); }}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 border border-brand-200 transition cursor-pointer"
                          aria-label={`Editar ${servicio.nombre}`}
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDelete(servicio.id); }}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
                          aria-label={`Eliminar ${servicio.nombre}`}
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Panel — resumen de selección */}
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
                <ShoppingCart size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Selección</h2>
                <p className="text-xs text-slate-500">{selectedItems.length} servicio(s) seleccionado(s)</p>
              </div>
            </div>

            {selectedItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Haz clic en un servicio para agregarlo a la cotización.</p>
            ) : (
              <div className="space-y-2">
                {selectedItems.map((item) => {
                  const precio = Number(item.precio_unitario || 0);
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 border border-slate-200">
                      <span className="text-xs font-medium text-slate-700 truncate">{item.nombre}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-600">${precio.toLocaleString('es-CL')}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
                          className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedItems.length > 0 && (
              <>
                <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">${totalSelected.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>IVA (19%)</span>
                    <span className="font-semibold">${Math.round(totalSelected * 0.19).toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-bold text-slate-900">
                    <span>Total</span>
                    <span className="text-brand-600">${Math.round(totalSelected * 1.19).toLocaleString('es-CL')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCrearOrden}
                  className="mt-3 w-full rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition shadow-md shadow-brand-600/20 cursor-pointer"
                >
                  Crear orden con selección
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Limpiar selección
                </button>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Modal de edición */}
      {editingService && (
        <EditModal
          servicio={editingService}
          onClose={() => setEditingService(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
