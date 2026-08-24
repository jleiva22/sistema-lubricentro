import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  Droplet, ShieldCheck, Clock, Wrench, Car, Calculator
} from 'lucide-react';

const oilBrands = [
  {
    name: 'Mobil 1',
    svg: (
      <svg className="h-7 w-auto transition-all duration-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 24V6h5.5l3.8 11.5L15 6h5.5v18h-4v-12l-3.8 12h-2.4L6.5 12V24H2z" fill="#003399" />
        <path d="M23 15c0-5 3.5-9 8.5-9s8.5 4 8.5 9-3.5 9-8.5 9-8.5-4-8.5-9zm13 0c0-3-2-5.5-4.5-5.5S27 12 27 15s2 5.5 4.5 5.5 4.5-2.5 4.5-5.5z" fill="#003399" />
        <path d="M42 24V2h4v8.2c1.2-2.2 3.5-3.7 6.3-3.7 4.8 0 8 3.6 8 8.5s-3.2 8.5-8 8.5c-2.8 0-5.1-1.5-6.3-3.7V24h-4zm9.8-3.5c2.6 0 4.5-2.2 4.5-5s-1.9-5-4.5-5-4.5 2.2-4.5 5 1.9 5 4.5 5z" fill="#003399" />
        <path d="M63 24V6h4v18h-4zm0-21V0h4v3h-4z" fill="#003399" />
        <path d="M70 24V2h4v22h-4z" fill="#003399" />
        <path d="M88 24h-4.2l-2-6h-7.5l-2 6H68l7-22h4.5l8.5 22zm-7.2-10l-2.3-7-2.3 7h4.6z" fill="#D32F2F" />
        <path d="M93 24V6h-3.2V2.5h7.2V24H93z" fill="#D32F2F" />
      </svg>
    ),
  },
  {
    name: 'Castrol',
    svg: (
      <svg className="h-7 w-auto transition-all duration-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100" viewBox="0 0 130 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 2.5C7 2.5 1 8.5 1 16.5S7 29.5 15 29.5c6.5 0 11.5-4 13.2-9.5h-5.2C21.6 22.8 18.5 25 15 25c-4.7 0-8.5-3.8-8.5-8.5S10.3 8 15 8c3.5 0 6.6 2.2 8 5h5.2C26.5 6.5 21.5 2.5 15 2.5z" fill="#00833E" />
        <path d="M28 12.5h-6c-1.5 0-2.5 1-2.5 2.5v10h4.5v-8h4v-4.5z" fill="#D32F2F" />
        <text x="36" y="21" fontFamily="sans-serif" fontWeight="900" fontSize="18" fill="#00833E" letterSpacing="0.5">Castrol</text>
      </svg>
    ),
  },
  {
    name: 'Liqui Moly',
    svg: (
      <svg className="h-7 w-auto transition-all duration-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="116" height="24" rx="4" fill="#003399" />
        <path d="M6 3h52v24H6z" fill="#D32F2F" />
        <text x="10" y="20" fontFamily="sans-serif" fontWeight="900" fontSize="13" fill="#FFFFFF">LIQUI</text>
        <text x="63" y="20" fontFamily="sans-serif" fontWeight="900" fontSize="13" fill="#FFFFFF">MOLY</text>
      </svg>
    ),
  },
  {
    name: 'Shell Helix',
    svg: (
      <svg className="h-8 w-auto transition-all duration-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100" viewBox="0 0 130 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2C7.4 2 2 7.4 2 14c0 3.2 1.3 6.1 3.4 8.3L14 30l8.6-7.7c2.1-2.2 3.4-5.1 3.4-8.3 0-6.6-5.4-12-12-12z" fill="#FFD500" stroke="#DD0000" strokeWidth="2" />
        <path d="M14 6c-4.4 0-8 3.6-8 8 0 2.2.9 4.2 2.3 5.7L14 25l5.7-5.3c1.4-1.5 2.3-3.5 2.3-5.7 0-4.4-3.6-8-8-8z" fill="#DD0000" />
        <text x="32" y="18" fontFamily="sans-serif" fontWeight="900" fontSize="15" fill="#DD0000" letterSpacing="0.5">Shell</text>
        <text x="73" y="18" fontFamily="sans-serif" fontWeight="700" fontSize="14" fill="#003399" italic="true">HELIX</text>
      </svg>
    ),
  },
  {
    name: 'Valvoline',
    svg: (
      <svg className="h-7 w-auto transition-all duration-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100" viewBox="0 0 125 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 3l10 24L24 3h-6l-4 11L10 3H4z" fill="#003399" />
        <path d="M14 17l4-14h-4l-4 14 4 0z" fill="#D32F2F" />
        <text x="28" y="21" fontFamily="sans-serif" fontWeight="800" fontSize="16" fill="#003399" letterSpacing="-0.5">Valvoline</text>
      </svg>
    ),
  },
  {
    name: 'Pennzoil',
    svg: (
      <svg className="h-7 w-auto transition-all duration-300 grayscale opacity-70 hover:grayscale-0 hover:opacity-100" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="116" height="22" rx="3" fill="#FFC72C" />
        <text x="8" y="20" fontFamily="sans-serif" fontWeight="900" fontSize="14" fill="#000000" letterSpacing="1">PENNZOIL</text>
      </svg>
    ),
  },
];

export default function LandingPage() {
  const { user } = useAuth();

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
            <Link to="/cotizar" className="text-sm font-medium text-slate-600 hover:text-brand-600 hidden sm:block">
              Cotizador Express
            </Link>
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
              Lubricentro Profesional
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
              <Link
                to="/cotizar"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-brand-600/25"
              >
                <Calculator size={18} /> Cotizar y Agendar
              </Link>
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

      {/* Brands Banner con SVGs */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">
            Trabajamos con las mejores marcas de lubricantes en Chile
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-14">
            {oilBrands.map((b) => (
              <div key={b.name} className="flex items-center justify-center p-2" title={b.name}>
                {b.svg}
              </div>
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
          <p>© 2026 Plataforma Lubricentro.</p>
        </div>
      </footer>
    </div>
  );
}