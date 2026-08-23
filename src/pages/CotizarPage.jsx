import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ordenesAPI, vehiculosAPI } from '../services/api';
import { Clock, Calendar, Check, X, ArrowLeft, Car, User } from 'lucide-react';

const oilTypes = [
    { id: 'mineral', name: 'Aceite Mineral', km: '5.000 KM', price: 48000, desc: 'Para motores tradicionales' },
    { id: 'semisintetico', name: 'Aceite Semisintético', km: '10.000 KM', price: 59000, desc: 'Uso urbano y carretera' },
    { id: 'sintetico', name: 'Aceite Sintético Premium', km: '15.000 KM', price: 79000, desc: 'Máxima protección' },
];

const oilBrands = ['Mobil 1', 'Castrol', 'Liqui Moly', 'Shell Helix', 'Valvoline', 'Pennzoil'];

const additionalServices = [
    { id: 'filtroAceite', label: 'Cambio Filtro de Aceite', price: 18000, duration: 15, serviceId: 4 },
    { id: 'filtroAire', label: 'Revisión Líquidos Refrigerantes', price: 22000, duration: 15, serviceId: 5 },
    { id: 'fluidos', label: 'Líquido Frenos / Hidráulico', price: 25000, duration: 20, serviceId: 6 },
    { id: 'frenosNeumaticos', label: 'Inspección Frenos y Neumáticos', price: 26000, duration: 25, serviceId: 10 },
];

export default function CotizarPage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Quote State
    const [selectedOil, setSelectedOil] = useState('semisintetico');
    const [selectedBrand, setSelectedBrand] = useState('Mobil 1');
    const [extras, setExtras] = useState({
        filtroAceite: true,
        filtroAire: false,
        fluidos: true,
        frenosNeumaticos: false,
    });

    const [fechaReserva, setFechaReserva] = useState(new Date().toISOString().slice(0, 10));
    const [horaReserva, setHoraReserva] = useState('10:00');

    // User & Vehicle State
    const [misVehiculos, setMisVehiculos] = useState([]);
    const [selectedVehiculoId, setSelectedVehiculoId] = useState('nuevo');

    // Modal State
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

    // Cargar vehículos del cliente autenticado
    useEffect(() => {
        if (isAuthenticated) {
            vehiculosAPI?.getAll?.()
                .then(res => {
                    const vehiculos = res.data || res;
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

    // Pre-poblar datos de usuario al autenticarse
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

    // Manejar cambio de vehículo registrado
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

    // Calculations
    const currentOilObj = oilTypes.find((o) => o.id === selectedOil) || oilTypes[1];
    const basePrice = currentOilObj.price;

    const extrasPrice = additionalServices.reduce((sum, item) => {
        return extras[item.id] ? sum + item.price : sum;
    }, 0);

    const totalTime = 30 + additionalServices.reduce((sum, item) => (extras[item.id] ? sum + item.duration : sum), 0);

    const subtotal = basePrice + extrasPrice;
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    const toggleExtra = (id) => {
        setExtras((prev) => ({ ...prev, [id]: !prev[id] }));
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
            // Construir IDs de servicios
            const selectedServiceIds = [
                selectedOil === 'mineral' ? 1 : selectedOil === 'semisintetico' ? 2 : 3
            ];
            additionalServices.forEach(extra => {
                if (extras[extra.id]) selectedServiceIds.push(extra.serviceId);
            });

            const fechaProgramada = `${fechaReserva}T${horaReserva}:00`;

            // Construir Payload según estado de autenticación
            const payload = isAuthenticated
                ? {
                    fecha_programada: fechaProgramada,
                    servicio_ids: selectedServiceIds,
                    observaciones_fallas: `Reserva Online (${selectedBrand} - ${currentOilObj.name})`,
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
                    observaciones_fallas: `Reserva Online (${selectedBrand} - ${currentOilObj.name})`,
                    tipo_aceite: selectedOil,
                    marca_aceite: selectedBrand,
                };

            const apiCall = isAuthenticated
                ? ordenesAPI.createReservaExpress(payload)
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
                    <p className="text-slate-500 text-xs mt-0.5">Configura las opciones de mantenimiento para tu vehículo.</p>
                </div>

                <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
                    {/* Opciones */}
                    <div className="space-y-8">

                        {/* 1. Tipo de Aceite */}
                        <section className="space-y-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">1. Tipo de Aceite</h2>
                            <div className="grid sm:grid-cols-3 gap-3">
                                {oilTypes.map((oil) => {
                                    const isSelected = selectedOil === oil.id;
                                    return (
                                        <button
                                            key={oil.id}
                                            type="button"
                                            onClick={() => setSelectedOil(oil.id)}
                                            className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${isSelected
                                                ? 'bg-white border-slate-900 ring-1 ring-slate-900 shadow-xs'
                                                : 'bg-white border-slate-200/80 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-slate-900">{oil.name}</span>
                                                {isSelected && <Check size={14} className="text-slate-900" />}
                                            </div>
                                            <p className="text-[11px] text-slate-500 mb-3">{oil.desc} • {oil.km}</p>
                                            <span className="text-sm font-bold text-slate-900">${oil.price.toLocaleString('es-CL')}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 2. Marca Preferida */}
                        <section className="space-y-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">2. Marca de Lubricante</h2>
                            <div className="flex flex-wrap gap-2">
                                {oilBrands.map((brand) => (
                                    <button
                                        key={brand}
                                        type="button"
                                        onClick={() => setSelectedBrand(brand)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${selectedBrand === brand
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300'
                                            }`}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 3. Servicios Adicionales */}
                        <section className="space-y-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">3. Adicionales Recomendados</h2>
                            <div className="bg-white rounded-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
                                {additionalServices.map((extra) => {
                                    const checked = extras[extra.id];
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
                                                    onChange={() => { }} // handled by row click
                                                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                                                />
                                                <span className="text-xs font-medium text-slate-800">{extra.label}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-900">+${extra.price.toLocaleString('es-CL')}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 4. Fecha y Hora */}
                        <section className="space-y-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">4. Agenda tu Atención</h2>
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

                    {/* Sidebar Resumen */}
                    <aside className="bg-white border border-slate-200/80 rounded-xl p-5 sticky top-6 space-y-4 shadow-xs">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                            Resumen
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-slate-700">
                                <span>{currentOilObj.name}</span>
                                <span className="font-semibold text-slate-900">${basePrice.toLocaleString('es-CL')}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 -mt-1">{selectedBrand}</p>

                            {additionalServices.map(
                                (extra) =>
                                    extras[extra.id] && (
                                        <div key={extra.id} className="flex justify-between text-slate-600 pt-1">
                                            <span>{extra.label}</span>
                                            <span className="text-slate-900 font-medium">+${extra.price.toLocaleString('es-CL')}</span>
                                        </div>
                                    )
                            )}
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
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Calendar size={14} /> Reservar Ahora
                        </button>
                    </aside>
                </div>
            </main>

            {/* MODAL DE DATOS */}
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
                                        /* VISTA PARA USUARIO AUTENTICADO */
                                        <div className="space-y-3">
                                            {/* Ficha compacta de usuario */}
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

                                            {/* Selección de Vehículo */}
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

                                            {/* Si selecciona 'nuevo' o no tiene vehículos previos */}
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
                                        /* VISTA PARA INVITADO / NO AUTENTICADO */
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

                                            <div className="grid grid-cols-3 gap-2">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Patente"
                                                    value={guestData.patente}
                                                    onChange={(e) => setGuestData((p) => ({ ...p, patente: e.target.value }))}
                                                    className="bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900 uppercase"
                                                />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Marca"
                                                    value={guestData.marca}
                                                    onChange={(e) => setGuestData((p) => ({ ...p, marca: e.target.value }))}
                                                    className="bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900"
                                                />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Modelo"
                                                    value={guestData.modelo}
                                                    onChange={(e) => setGuestData((p) => ({ ...p, modelo: e.target.value }))}
                                                    className="bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-slate-900"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full mt-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition-all text-xs cursor-pointer disabled:opacity-70"
                                    >
                                        {submitting ? 'Confirmando...' : 'Finalizar Reserva'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-4 space-y-3">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto">
                                    <Check size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">¡Reserva Registrada!</h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        N° Orden: <strong>#{createdOrderId}</strong> • Patente: <strong>{guestData.patente}</strong>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBookingModal(false);
                                        setBookingSuccess(false);
                                        if (isAuthenticated) navigate('/dashboard');
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                                >
                                    {isAuthenticated ? 'Ir a mi Panel' : 'Cerrar'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}