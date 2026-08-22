import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  Droplet, ShieldCheck, Clock, Wrench, Car, Calculator
} from 'lucide-react';

const oilBrands = ['Mobil 1', 'Castrol', 'Liqui Moly', 'Shell Helix', 'Valvoline', 'Pennzoil'];

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
          <p>© 2026 Plataforma Lubricentro.</p>
        </div>
      </footer>
    </div>
  );
}