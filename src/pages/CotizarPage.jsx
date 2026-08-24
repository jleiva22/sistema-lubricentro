import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ordenesAPI, vehiculosAPI, catalogoAPI } from '../services/api';
import { Clock, Calendar, Check, X, ArrowLeft, Car, User, Loader2, Droplet, Tag } from 'lucide-react';

export default function CotizarPage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Estado del Catálogo
    const [catalogo, setCatalogo] = useState([]);
    const [loadingCatalogo, setLoadingCatalogo] = useState(true);
    const [errorCatalogo, setErrorCatalogo] = useState(null);

    // Estado de Selecciones
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [selectedExtraIds, setSelectedExtraIds] = useState([]);

    const [fechaReserva, setFechaReserva] = useState(new Date().toISOString().slice(0, 10));
    const [horaReserva, setHoraReserva] = useState('10:00');

    // Estado de Usuario y Vehículo
    const [misVehiculos, setMisVehiculos] = useState([]);
    const [selectedVehiculoId, setSelectedVehiculoId] = useState('nuevo');

    // Estado del Modal
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [guestData, setGuestData] = useState({
        nombre: '',
        apellido: '',
        rut: '',
        telefono: '',
        email: '',
        patente: '',
        marca: '',
        modelo: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState(null);

    // Cargar Catálogo desde backend
    useEffect(() => {
        let isMounted = true;
        setLoadingCatalogo(true);

        const apiCall = catalogoAPI.getPublic
            ? catalogoAPI.getPublic().catch(() => catalogoAPI.getAll())
            : catalogoAPI.getAll();

        apiCall
            .then(res => {
                if (!isMounted) return;

                const rawData = res.data?.data || res.data?.catalogos || res.data?.servicios || res.data || [];
                const list = Array.isArray(rawData) ? rawData : [];

                const normalizedList = list.map(item => ({
                    id: item.id || item.id_catalogo || item.id_servicio,
                    nombre: item.nombre || item.nombre_servicio || item.titulo || 'Servicio sin nombre',
                    descripcion: item.descripcion || item.detalle || '',
                    precio: Number(item.precio || item.precio_unitario || item.precio_base || item.valor || 0),
                    tiempo: Number(item.tiempo_minutos || item.duracion || item.duracion_estimada || 30),
                    categoria: item.categoria || item.tipo || 'General',
                    marca: item.marca || item.marca_aceite || null,
                }));

                setCatalogo(normalizedList);

                if (normalizedList.length > 0) {
                    const defaultService = normalizedList.find(s =>
                        s.nombre.toLowerCase().includes('aceite') ||
                        s.categoria.toLowerCase().includes('aceite') ||
                        s.categoria.toLowerCase().includes('lubricat')
                    ) || normalizedList[0];

                    setSelectedServiceId(defaultService.id);
                }
            })
            .catch(err => {
                console.error('Error al cargar catálogo desde API:', err);
                if (isMounted) setErrorCatalogo('No se pudieron obtener los servicios.');
            })
            .finally(() => {
                if (isMounted) setLoadingCatalogo(false);
            });

        return () => { isMounted = false; };
    }, []);

    // Cargar vehículos del usuario autenticado
    useEffect(() => {
        if (isAuthenticated) {
            vehiculosAPI?.getAll?.()
                .then(res => {
                    const vehiculos = res.data?.data || res.data || [];
                    if (Array.isArray(vehiculos) && vehiculos.length > 0) {
                        setMisVehiculos(vehiculos);
                        const primerVehiculo = vehiculos[0];
                        setSelectedVehiculoId(primerVehiculo.id);
                        setGuestData(prev => ({ ...prev, patente: primerVehiculo.patente || '' }));
                    }
                })
                .catch(err => console.error('Error al cargar vehículos:', err));
        }
    }, [isAuthenticated]);

    // Pre-poblar datos de usuario
    useEffect(() => {
        if (user) {
            setGuestData(prev => ({
                ...prev,
                nombre: user.nombre || prev.nombre,
                apellido: user.apellido || prev.apellido,
                email: user.email || prev.email,
                rut: user.rut || prev.rut,
                telefono: user.telefono || prev.telefono,
            }));
        }
    }, [user]);

    // Filtrar servicios
    const serviciosAceite = useMemo(() => {
        const list = catalogo.filter(s =>
            s.nombre.toLowerCase().includes('aceite') ||
            s.categoria.toLowerCase().includes('aceite') ||
            s.categoria.toLowerCase().includes('lubricat')
        );
        return list.length > 0 ? list : catalogo;
    }, [catalogo]);

    const serviciosAdicionales = useMemo(() => {
        return catalogo.filter(s => !serviciosAceite.some(a => a.id === s.id));
    }, [catalogo, serviciosAceite]);

    // Servicio actual seleccionado
    const currentServiceObj = catalogo.find(s => s.id === selectedServiceId) || serviciosAceite[0] || {};
    const basePrice = currentServiceObj.precio || 0;
    const baseTime = currentServiceObj.tiempo || 30;

    const extrasSeleccionados = useMemo(() => {
        return catalogo.filter(s => selectedExtraIds.includes(s.id));
    }, [catalogo, selectedExtraIds]);

    const extrasPrice = extrasSeleccionados.reduce((sum, item) => sum + item.precio, 0);
    const extrasTime = extrasSeleccionados.reduce((sum, item) => sum + item.tiempo, 0);

    const subtotal = basePrice + extrasPrice;
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;
    const totalTime = baseTime + extrasTime;

    const handleSelectVehiculo = (e) => {
        const val = e.target.value;
        setSelectedVehiculoId(val);

        if (val === 'nuevo') {
            setGuestData(prev => ({ ...prev, patente: '' }));
        } else {
            const v = misVehiculos.find(item => item.id.toString() === val.toString());
            if (v) {
                setGuestData(prev => ({ ...prev, patente: v.patente || '' }));
            }
        }
    };

    const toggleExtra = (id) => {
        setSelectedExtraIds(prev =>
            prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]
        );
    };

    const handleStartBooking = () => {
        if (user && (user.rol === 'administrador' || user.rol === 'mecanico')) {
            navigate('/ordenes/nueva');
        } else {
            setShowBookingModal(true);
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const selectedServiceIds = [
                ...(selectedServiceId ? [selectedServiceId] : []),
                ...selectedExtraIds
            ];

            const fechaProgramada = `${fechaReserva}T${horaReserva}:00`;
            const marcaTexto = currentServiceObj.marca ? ` (${currentServiceObj.marca})` : '';
            const detalleServicio = `Reserva Online - Servicio: ${currentServiceObj.nombre || 'Mantenimiento'}${marcaTexto}`;

            const payload = isAuthenticated
                ? {
                    fecha_programada: fechaProgramada,
                    servicio_ids: selectedServiceIds,
                    observaciones_fallas: detalleServicio,
                    cliente_id: user?.cliente_id || user?.id,
                    vehiculo_id: selectedVehiculoId !== 'nuevo' ? selectedVehiculoId : null,
                    ...(selectedVehiculoId === 'nuevo' && {
                        patente: guestData.patente,
                        marca: guestData.marca || 'Multimarca',
                        modelo: guestData.modelo || 'Estándar',
                    }),
                }
                : {
                    nombre: guestData.nombre,
                    apellido: guestData.apellido,
                    rut: guestData.rut,
                    telefono: guestData.telefono,
                    email: guestData.email,
                    patente: guestData.patente,
                    marca: guestData.marca || 'Multimarca',
                    modelo: guestData.modelo || 'Estándar',
                    fecha_programada: `${fechaReserva} ${horaReserva}:00`,
                    servicio_ids: selectedServiceIds,
                    observaciones_fallas: detalleServicio,
                };

            const apiCall = isAuthenticated
                ? ordenesAPI.createOrdenCliente(payload)
                : ordenesAPI.createPublicReserva(payload);

            const res = await apiCall;

            setCreatedOrderId(res.data?.data?.id || res.data?.id || 'OK');
            setBookingSuccess(true);
        } catch (err) {
            alert('Error al registrar reserva: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingCatalogo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                    <Loader2 size={20} className="animate-spin text-slate-900" />
                    Cargando catálogo de servicios...
                </div>
            </div>
        );
    }

    if (errorCatalogo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-6 rounded-xl border border-rose-200 text-center max-w-md shadow-xs">
                    <p className="text-sm text-rose-600 font-semibold mb-2">{errorCatalogo}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-800 pb-16">
            <div className="max-w-5xl mx-auto px-4 pt-6">
                <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={14} /> Volver
                </Link>
            </div>

            <main className="max-w-5xl mx-auto px-4 pt-4">
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cotizar Servicio</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Selecciona el servicio que deseas agendar.</p>
                </div>

                <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
                    <div className="space-y-8">

                        {/* 1. Selección de Servicio Principal */}
                        <section className="space-y-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">1. Servicios Disponibles</h2>
                            {serviciosAceite.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No hay servicios registrados.</p>
                            ) : (
                                <div className="grid sm:grid-cols-3 gap-3">
                                    {serviciosAceite.map((item) => {
                                        const isSelected = selectedServiceId === item.id;

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setSelectedServiceId(item.id)}
                                                className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${isSelected
                                                    ? 'bg-white border-slate-900 ring-1 ring-slate-900 shadow-xs'
                                                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-slate-900">{item.nombre}</span>
                                                    {isSelected && <Check size={14} className="text-slate-900" />}
                                                </div>
                                                <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">{item.descripcion || 'Servicio registrado en catálogo'}</p>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="flex items-center gap-1 text-[10px] text-blue-700">
                                                        <Droplet size={11} />
                                                        <span>{item.categoria}</span>
                                                    </div>
                                                    {item.marca && (
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                                                            <Tag size={10} />
                                                            <span>{item.marca}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <span className="text-sm font-bold text-slate-900">${item.precio.toLocaleString('es-CL')}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* 2. Adicionales */}
                        {serviciosAdicionales.length > 0 && (
                            <section className="space-y-3">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">2. Servicios Adicionales</h2>
                                <div className="bg-white rounded-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
                                    {serviciosAdicionales.map((extra) => {
                                        const checked = selectedExtraIds.includes(extra.id);

                                        return (
                                            <label
                                                key={extra.id}
                                                onClick={() => toggleExtra(extra.id)}
                                                className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => { }}
                                                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                                                    />
                                                    <div>
                                                        <span className="text-xs font-medium text-slate-800 block">{extra.nombre}</span>
                                                        <span className="text-[10px] text-slate-400">{extra.categoria}</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-900">+${extra.precio.toLocaleString('es-CL')}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* 3. Agenda */}
                        <section className="space-y-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">3. Agenda tu Atención</h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={fechaReserva}
                                        onChange={(e) => setFechaReserva(e.target.value)}
                                        className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1">Hora</label>
                                    <select
                                        value={horaReserva}
                                        onChange={(e) => setHoraReserva(e.target.value)}
                                        className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900 transition-colors"
                                    >
                                        <option value="09:00">09:00 hrs</option>
                                        <option value="10:00">10:00 hrs</option>
                                        <option value="11:30">11:30 hrs</option>
                                        <option value="15:00">15:00 hrs</option>
                                        <option value="16:30">16:30 hrs</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Resumen Sidebar */}
                    <aside className="bg-white border border-slate-200/80 rounded-xl p-5 sticky top-6 space-y-4 shadow-xs">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                            Resumen
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-slate-700">
                                <span>{currentServiceObj.nombre || 'Seleccione un servicio'}</span>
                                <span className="font-semibold text-slate-900">${basePrice.toLocaleString('es-CL')}</span>
                            </div>
                            {currentServiceObj.marca && (
                                <p className="text-[11px] text-slate-400 -mt-1 flex items-center gap-1">
                                    <Tag size={10} /> Marca: <strong className="text-slate-600">{currentServiceObj.marca}</strong>
                                </p>
                            )}

                            {extrasSeleccionados.map((extra) => (
                                <div key={extra.id} className="flex justify-between text-slate-600 pt-1">
                                    <span>{extra.nombre}</span>
                                    <span className="text-slate-900 font-medium">+${extra.precio.toLocaleString('es-CL')}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-400">
                                <span>Subtotal</span>
                                <span>${subtotal.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>IVA (19%)</span>
                                <span>${iva.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                                <span>Total Estimado</span>
                                <span>${total.toLocaleString('es-CL')}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                            <Clock size={13} className="text-slate-400" />
                            <span>Tiempo estimado: <strong>{totalTime} min</strong></span>
                        </div>

                        <button
                            type="button"
                            onClick={handleStartBooking}
                            disabled={!selectedServiceId}
                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Calendar size={14} /> Reservar Ahora
                        </button>
                    </aside>
                </div>
            </main>

            {/* Modal de confirmación */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-5 space-y-4 relative shadow-lg">
                        <button
                            type="button"
                            onClick={() => setShowBookingModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        {!bookingSuccess ? (
                            <>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Confirmar Reserva</h3>
                                    <p className="text-xs text-slate-500">
                                        {isAuthenticated ? 'Revisa tus datos y selecciona tu vehículo.' : 'Ingresa tus datos de contacto y vehículo.'}
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-100">
                                    <div className="flex justify-between">
                                        <span>Fecha:</span>
                                        <strong className="text-slate-900">{fechaReserva} - {horaReserva} hrs</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total:</span>
                                        <strong className="text-slate-900">${total.toLocaleString('es-CL')}</strong>
                                    </div>
                                </div>

                                <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
                                    {isAuthenticated ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                                                <div className="p-1.5 bg-slate-900 text-white rounded-md">
                                                    <User size={14} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-semibold text-slate-900 truncate">
                                                        {user?.nombre} {user?.apellido}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                                                </div>
                                            </div>

                                            {misVehiculos.length > 0 && (
                                                <div>
                                                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                                        Vehículo a atender
                                                    </label>
                                                    <select
                                                        value={selectedVehiculoId}
                                                        onChange={handleSelectVehiculo}
                                                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900"
                                                    >
                                                        {misVehiculos.map(v => (
                                                            <option key={v.id} value={v.id}>
                                                                {v.marca} {v.modelo} ({v.patente})
                                                            </option>
                                                        ))}
                                                        <option value="nuevo">+ Ingresar otro vehículo</option>
                                                    </select>
                                                </div>
                                            )}

                                            {(selectedVehiculoId === 'nuevo' || misVehiculos.length === 0) && (
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                                            Patente del Vehículo
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                required
                                                                placeholder="Patente (ej: AB1234)"
                                                                value={guestData.patente}
                                                                onChange={(e) => setGuestData((p) => ({ ...p, patente: e.target.value }))}
                                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 pl-8 text-slate-900 focus:outline-none focus:border-slate-900 uppercase"
                                                            />
                                                            <Car size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                                                Marca
                                                            </label>
                                                            <input
                                                                type="text"
                                                                required
                                                                placeholder="Toyota"
                                                                value={guestData.marca}
                                                                onChange={(e) => setGuestData((p) => ({ ...p, marca: e.target.value }))}
                                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                                                Modelo
                                                            </label>
                                                            <input
                                                                type="text"
                                                                required
                                                                placeholder="Yaris"
                                                                value={guestData.modelo}
                                                                onChange={(e) => setGuestData((p) => ({ ...p, modelo: e.target.value }))}
                                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Nombre"
                                                    value={guestData.nombre}
                                                    onChange={(e) => setGuestData((p) => ({ ...p, nombre: e.target.value }))}
                                                    className="bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900"
                                                />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Apellido"
                                                    value={guestData.apellido}
                                                    onChange={(e) => setGuestData((p) => ({ ...p, apellido: e.target.value }))}
                                                    className="bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="RUT"
                                                    value={guestData.rut}
                                                    onChange={(e) => setGuestData((p) => ({ ...p, rut: e.target.value }))}
                                                    className="bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900"
                                                />
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="Teléfono"
                                                    value={guestData.telefono}
                                                    onChange={(e) => setGuestData((p) => ({ ...p, telefono: e.target.value }))}
                                                    className="bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900"
                                                />
                                            </div>

                                            <input
                                                type="email"
                                                required
                                                placeholder="Correo Electrónico"
                                                value={guestData.email}
                                                onChange={(e) => setGuestData((p) => ({ ...p, email: e.target.value }))}
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900"
                                            />

                                            <div className="space-y-2 pt-1 border-t border-slate-100">
                                                <div>
                                                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                                        Patente del Vehículo
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Patente (ej: AB1234)"
                                                            value={guestData.patente}
                                                            onChange={(e) => setGuestData((p) => ({ ...p, patente: e.target.value }))}
                                                            className="w-full bg-white border border-slate-200 rounded-lg p-2 pl-8 text-slate-900 focus:outline-none focus:border-slate-900 uppercase"
                                                        />
                                                        <Car size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                                            Marca
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Toyota"
                                                            value={guestData.marca}
                                                            onChange={(e) => setGuestData((p) => ({ ...p, marca: e.target.value }))}
                                                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                                            Modelo
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Yaris"
                                                            value={guestData.modelo}
                                                            onChange={(e) => setGuestData((p) => ({ ...p, modelo: e.target.value }))}
                                                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition-all text-xs flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                                    >
                                        {submitting ? 'Procesando...' : 'Confirmar y Agendar'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-4 space-y-3">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                    <Check size={24} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">¡Reserva Confirmada!</h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Tu orden N° <strong>{createdOrderId}</strong> ha sido agendada exitosamente.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBookingModal(false);
                                        setBookingSuccess(false);
                                        navigate('/');
                                    }}
                                    className="w-full bg-slate-900 text-white font-semibold py-2 rounded-lg text-xs cursor-pointer"
                                >
                                    Volver al Inicio
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}