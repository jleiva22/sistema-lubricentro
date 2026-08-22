import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ordenesAPI, catalogoAPI } from '../services/api';
import {
  Droplet, ShieldCheck, Clock, Wrench, Car,
  Phone, MapPin, Mail, Calendar, CheckCircle2, X, Calculator
} from 'lucide-react';

const oilTypes = [
  { id: 'mineral', name: 'Aceite Mineral', km: 'Cada 5.000 KM', price: 48000, desc: 'Protección estándar para motores tradicionales' },
  { id: 'semisintetico', name: 'Aceite Semisintético', km: 'Cada 10.000 KM', price: 59000, desc: 'Mezcla equilibrada para uso urbano y carretera' },
  { id: 'sintetico', name: 'Aceite Sintético Premium', km: 'Cada 10.000 - 15.000 KM', price: 79000, desc: 'Máxima protección contra el desgaste del motor' },
];

const oilBrands = ['Mobil 1', 'Castrol', 'Liqui Moly', 'Shell Helix', 'Valvoline', 'Pennzoil'];

const additionalServices = [
  { id: 'filtroAceite', label: 'Control y Cambio Filtro de Aceite', price: 18000, duration: 15, serviceId: 5 },
  { id: 'filtroAire', label: 'Control de Liquidos Refrigerantes', price: 22000, duration: 15, serviceId: 6 },
  { id: 'fluidos', label: 'Cambio Líquido de Frenos / Hidráulico', price: 25000, duration: 20, serviceId: 7 },
  { id: 'frenosNeumaticos', label: 'Inspección Neumáticos y Pastillas de Freno', price: 26000, duration: 25, serviceId: 11 },
];

export default function LandingPage() {
  const { user } = useAuth();
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

  // Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [guestData, setGuestData] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    telefono: '',
    email: '',
    patente: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

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
    if (user) {
      navigate('/ordenes/nueva');
    } else {
      setShowBookingModal(true);
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedServiceIds = [
        selectedOil === 'mineral' ? 2 : selectedOil === 'semisintetico' ? 3 : 4
      ];
      if (extras.filtroAceite) selectedServiceIds.push(5);
      if (extras.filtroAire) selectedServiceIds.push(6);
      if (extras.fluidos) selectedServiceIds.push(7);
      if (extras.frenosNeumaticos) selectedServiceIds.push(11);

      const res = await ordenesAPI.createPublicReserva({
        nombre: guestData.nombre,
        apellido: guestData.apellido,
        rut: guestData.rut,
        telefono: guestData.telefono,
        email: guestData.email,
        patente: guestData.patente,
        marca: 'Multimarca',
        modelo: 'Estándar',
        fecha_programada: `${fechaReserva} ${horaReserva}:00`,
        servicio_ids: selectedServiceIds,
        observaciones_fallas: `Reserva Express desde Cotizador Landing (${selectedBrand} - ${currentOilObj.name})`,
      });

      setCreatedOrderId(res.data?.data?.id || null);
      setBookingSuccess(true);
    } catch (err) {
      alert('Error al registrar reserva en la base de datos: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="border-b border-slate-200 backdrop-blur-xl bg-white/90 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-600/20">
              <Droplet size={20} />
            </div>
            <span className="text-lg font-bold text-slate-900">LubriExpress</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#cotizador" className="text-sm font-medium text-slate-600 hover:text-brand-600 hidden sm:block">
              Cotizador Express
            </a>
            {user ? (
              <Link
                to="/dashboard"
                className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-brand-600/20"
              >
                Ir a Mi Panel ({user.nombre})
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-brand-600/20"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-100/80 border border-brand-200 text-brand-800 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
              <Car size={16} />
              Lubricentro Profesional • Conectado a Base de Datos MySQL
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight text-slate-900 mb-6">
              Cotiza y agenda tu{' '}
              <span className="text-brand-600">
                cambio de aceite
              </span>{' '}
              sin esperas
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl leading-relaxed">
              Mantención preventiva completa para todas las marcas. Registro directo de ordenes de trabajo en fosa y emisión de boleta electrónica.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#cotizador"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-brand-600/25"
              >
                <Calculator size={18} /> Cotizar y Agendar en BD Real
              </a>
              <a
                href="#servicios"
                className="inline-flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 px-6 py-3.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Ver Marcas y Servicios
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Atención Directa en Fosa</h3>
                <p className="text-xs text-slate-500">Almacenamiento real en PostgreSQL / MySQL</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span>Tiempo de Cambio de Aceite</span>
                <span className="font-bold text-brand-600">~30 Minutos</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span>Tiempo con Servicios Extra</span>
                <span className="font-bold text-emerald-600">~60 Minutos</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span>Boleta Electrónica e IVA (19%)</span>
                <span className="font-bold text-slate-900">Calculado en Servidor API</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COTIZADOR Y AGENDADOR EXPRESS */}
      <section id="cotizador" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-20">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-10 shadow-xl space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-700 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full border border-brand-200 mb-2">
              Persistencia Directa en Base de Datos
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">Cotizador y Reserva Directa en BD</h2>
            <p className="text-slate-500 text-sm mt-1">
              Personaliza tu servicio de lubricación, calcula tu total con IVA y agenda la hora conveniente.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
            {/* Step Selection */}
            <div className="space-y-6">
              {/* 1. Tipo de Aceite */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Droplet size={18} className="text-brand-600" /> 1. Elige Tipo de Aceite (Frecuencia de reemplazo)
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {oilTypes.map((oil) => (
                    <button
                      key={oil.id}
                      type="button"
                      onClick={() => setSelectedOil(oil.id)}
                      className={`p-4 rounded-xl border text-left transition ${selectedOil === oil.id
                          ? 'bg-brand-50 border-brand-500 text-brand-950 ring-2 ring-brand-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                    >
                      <span className="block font-bold text-sm text-slate-900">{oil.name}</span>
                      <span className="inline-block text-[11px] font-bold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded mt-1">
                        {oil.km}
                      </span>
                      <p className="text-xs text-slate-500 mt-2">{oil.desc}</p>
                      <p className="text-base font-extrabold text-slate-900 mt-3">${oil.price.toLocaleString('es-CL')}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Marca de Aceite */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  2. Marca Preferida (Marcas Líderes en Chile)
                </label>
                <div className="flex flex-wrap gap-2">
                  {oilBrands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setSelectedBrand(brand)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${selectedBrand === brand
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Servicios Adicionales */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" /> 3. Mantenimiento Preventivo Adicional
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {additionalServices.map((extra) => {
                    const checked = extras[extra.id];
                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => toggleExtra(extra.id)}
                        className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition ${checked
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{extra.label}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">+${extra.price.toLocaleString('es-CL')}</p>
                        </div>
                        <CheckCircle2 size={18} className={checked ? 'text-emerald-600 shrink-0' : 'text-slate-300 shrink-0'} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Fecha y Hora */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fecha de Atención</label>
                  <input
                    type="date"
                    value={fechaReserva}
                    onChange={(e) => setFechaReserva(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bloque Horario</label>
                  <select
                    value={horaReserva}
                    onChange={(e) => setHoraReserva(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-brand-600"
                  >
                    <option value="09:00">09:00 hrs (Mañana)</option>
                    <option value="10:00">10:00 hrs (Mañana)</option>
                    <option value="11:30">11:30 hrs (Mañana)</option>
                    <option value="15:00">15:00 hrs (Tarde)</option>
                    <option value="16:30">16:30 hrs (Tarde)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">Resumen de Cotización</h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>{currentOilObj.name} ({selectedBrand})</span>
                    <span className="font-bold text-slate-900">${basePrice.toLocaleString('es-CL')}</span>
                  </div>

                  {additionalServices.map(
                    (extra) =>
                      extras[extra.id] && (
                        <div key={extra.id} className="flex justify-between text-slate-600">
                          <span>{extra.label}</span>
                          <span className="text-slate-900 font-semibold">+${extra.price.toLocaleString('es-CL')}</span>
                        </div>
                      )
                  )}
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Neto:</span>
                    <span>${subtotal.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IVA (19%):</span>
                    <span>${iva.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Estimado:</span>
                    <span className="text-emerald-600 text-lg">${total.toLocaleString('es-CL')}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1 text-brand-700 font-semibold">
                    <Clock size={14} /> Tiempo estimado en fosa: {totalTime} minutos
                  </p>
                  <p className="text-slate-500">Se guardará en la tabla <code>ordenes_trabajo</code> de MySQL.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartBooking}
                className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-brand-600/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Calendar size={18} /> Confirmar y Guardar en BD
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services summary section */}
      <section id="servicios" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Servicios de Mantención Preventiva</h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm">
            Control de fluidos de motor, frenos, dirección hidráulica y agua limpiaparabrisas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4">
              <Droplet size={22} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Cambio de Aceite de Motor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Aceites Minerales (5.000 km), Semisintéticos (10.000 km) y Sintéticos (15.000 km).
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Filtros & Nivel de Fluidos</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filtro de aceite, aire y cabina. Reposición de refrigerante, líquido de frenos y agua sapito.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
              <Wrench size={22} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Inspección de Seguridad</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Revisión visual de presión de neumáticos, pastillas de freno, luces y escobillas.
            </p>
          </div>
        </div>
      </section>

      {/* Brands Banner */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
            Trabajamos con las mejores marcas de lubricantes en Chile
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-14">
            {oilBrands.map((b) => (
              <span key={b} className="text-lg font-black text-slate-400 hover:text-brand-600 transition-colors">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Droplet size={18} className="text-brand-600" />
            <span className="font-bold text-slate-900 text-sm">LubriExpress Chile</span>
          </div>
          <p>© 2026 Plataforma Lubricentro. Producción con Base de Datos MySQL.</p>
        </div>
      </footer>

      {/* GUEST QUICK BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            {!bookingSuccess ? (
              <>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Reserva Directa a Base de Datos</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Tus datos crearán la orden en la tabla <code>ordenes_trabajo</code> de la BD.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                  <p><strong>Servicio:</strong> {currentOilObj.name} ({selectedBrand})</p>
                  <p><strong>Fecha:</strong> {fechaReserva} a las {horaReserva} hrs</p>
                  <p><strong>Total Estimado:</strong> <strong className="text-emerald-600">${total.toLocaleString('es-CL')}</strong></p>
                </div>

                <form onSubmit={handleGuestSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Juan"
                        value={guestData.nombre}
                        onChange={(e) => setGuestData((p) => ({ ...p, nombre: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Apellido</label>
                      <input
                        type="text"

                        required
                        placeholder="Ej: Pérez"
                        value={guestData.apellido}
                        onChange={(e) => setGuestData((p) => ({ ...p, apellido: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">RUT</label>
                      <input
                        type="text"
                        required
                        placeholder="12.345.678-9"
                        value={guestData.rut}
                        onChange={(e) => setGuestData((p) => ({ ...p, rut: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Teléfono</label>
                      <input
                        type="tel"
                        required
                        placeholder="+56 9 1234 5678"
                        value={guestData.telefono}
                        onChange={(e) => setGuestData((p) => ({ ...p, telefono: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        required
                        placeholder="juan@correo.cl"
                        value={guestData.email}
                        onChange={(e) => setGuestData((p) => ({ ...p, email: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Patente Vehículo</label>
                      <input
                        type="text"
                        required
                        placeholder="AB-1234"
                        value={guestData.patente}
                        onChange={(e) => setGuestData((p) => ({ ...p, patente: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-brand-600 uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm shadow-md shadow-emerald-600/20 disabled:opacity-70"
                  >
                    {submitting ? 'Guardando en BD...' : 'Guardar Reserva en BD MySQL'}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-slate-500 text-[11px]">¿Ya tienes cuenta de cliente? </span>
                    <Link to="/login" className="text-brand-600 font-bold hover:underline text-[11px]">
                      Iniciar Sesión aquí
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">¡Reserva Insertada en la BD!</h3>
                <p className="text-xs text-slate-600">
                  Se ha generado la <strong>Orden de Trabajo #{createdOrderId || '1'}</strong> en MySQL para{' '}
                  <strong className="text-slate-900">{guestData.nombre}</strong> (Patente: <strong className="text-brand-600">{guestData.patente}</strong>).
                </p>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                  ✅ Datos guardados en tablas: <code>clientes</code>, <code>vehiculos</code> y <code>ordenes_trabajo</code>.
                </div>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-6 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
