import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Droplet, Mail, Lock, AlertCircle, ShieldCheck, Wrench, User, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regData, setRegData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rut: '',
    telefono: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleDemoSelect = (demoEmail, demoPass) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!regData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!regData.email.trim() || !regData.password) {
      setError('El correo y la contraseña son obligatorios');
      return;
    }

    setLoading(true);
    try {
      await register(regData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al registrarse. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-md">
        <p className="text-left mt-6 text-sm text-slate-500">
          <Link to="/" className="text-brand-600 font-semibold hover:underline transition-colors">
            ← Volver al Inicio
          </Link>
        </p>
        {/* Brand */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/25 text-white">
              <Droplet size={26} />
            </div>
            <span className="text-2xl font-bold text-slate-900">LubriExpress</span>
          </Link>
          <p className="text-slate-600 text-sm">Plataforma de Atención y Mantención de Vehículos</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${mode === 'login'
              ? 'bg-white text-brand-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${mode === 'register'
              ? 'bg-white text-brand-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Crear Cuenta (Registro)
          </button>
        </div>

        {/* Demo profiles shortcuts for evaluators */}
        {mode === 'login' && (
          <div className="mb-6 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <p className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-2.5 text-center">
              Acceso Rápido por Perfil:
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoSelect('admin@lubricentro.cl', 'Admin123!')}
                className="p-2.5 bg-slate-50 border border-slate-200 hover:border-brand-500 rounded-xl text-slate-700 hover:text-brand-700 font-semibold flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <ShieldCheck size={16} className="text-brand-600" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSelect('mecanico@lubricentro.cl', 'Mecanico123!')}
                className="p-2.5 bg-slate-50 border border-slate-200 hover:border-amber-500 rounded-xl text-slate-700 hover:text-amber-700 font-semibold flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <Wrench size={16} className="text-amber-600" />
                <span>Mecánico</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSelect('cliente@lubricentro.cl', 'Cliente123!')}
                className="p-2.5 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-xl text-slate-700 hover:text-emerald-700 font-semibold flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <User size={16} className="text-emerald-600" />
                <span>Cliente</span>
              </button>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-600/50 text-white font-bold py-2.5 rounded-xl transition-all text-sm cursor-pointer disabled:cursor-not-allowed shadow-md shadow-brand-600/25"
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Juan"
                    value={regData.nombre}
                    onChange={(e) => setRegData((p) => ({ ...p, nombre: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-brand-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    placeholder="Pérez"
                    value={regData.apellido}
                    onChange={(e) => setRegData((p) => ({ ...p, apellido: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-brand-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">RUT</label>
                  <input
                    type="text"
                    placeholder="12.345.678-9"
                    value={regData.rut}
                    onChange={(e) => setRegData((p) => ({ ...p, rut: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-brand-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="+56912345678"
                    value={regData.telefono}
                    onChange={(e) => setRegData((p) => ({ ...p, telefono: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-brand-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="correo@ejemplo.com"
                    value={regData.email}
                    onChange={(e) => setRegData((p) => ({ ...p, email: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-brand-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regData.password}
                    onChange={(e) => setRegData((p) => ({ ...p, password: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-brand-600 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-bold py-2.5 rounded-xl transition-all text-xs cursor-pointer shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                {loading ? 'Creando cuenta...' : 'Registrarme como Cliente'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

