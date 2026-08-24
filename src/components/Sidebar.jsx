import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  Droplet, LayoutDashboard, Users, Car, Wrench,
  ClipboardList, FileText, Package, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const navItems = {
  administrador: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard General' },
    { to: '/ordenes', icon: ClipboardList, label: 'Órdenes de Trabajo' },
    { to: '/clientes', icon: Users, label: 'Clientes' },
    { to: '/vehiculos', icon: Car, label: 'Vehículos' },
    { to: '/catalogo', icon: Package, label: 'Catálogo Servicios' },
    { to: '/boletas', icon: FileText, label: 'Boletas' },
    { to: '/usuarios', icon: Wrench, label: 'Gestión Usuarios' },
  ],
  mecanico: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Taller & Bahías' },
    { to: '/ordenes', icon: ClipboardList, label: 'Órdenes de Trabajo' },
    { to: '/vehiculos', icon: Car, label: 'Vehículos' },
    { to: '/catalogo', icon: Package, label: 'Catálogo Servicios' },
    { to: '/boletas', icon: FileText, label: 'Boletas' },
  ],
  cliente: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Mi Panel' },
    { to: '/ordenes', icon: ClipboardList, label: 'Mis Órdenes' },
    { to: '/vehiculos', icon: Car, label: 'Mis Vehículos' },
    { to: '/catalogo', icon: Package, label: 'Catálogo & Precios' },
    { to: '/boletas', icon: FileText, label: 'Mis Boletas' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const items = navItems[user.rol] || navItems.cliente;

  const rolLabel = {
    administrador: 'Administrador',
    mecanico: 'Mecánico / Taller',
    cliente: 'Cliente Registrado',
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="no-print fixed top-4 left-4 z-50 lg:hidden bg-white text-slate-800 p-2.5 rounded-xl border border-slate-200 shadow-md"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay mobile */}
      {open && (
        <div
          className="no-print fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`no-print fixed top-0 left-0 z-40 h-dvh w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-md shadow-brand-600/25 text-white">
              <Droplet size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-wide">LubriExpress</h1>
              <p className="text-[11px] font-medium text-brand-600">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClasses}
              onClick={() => setOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user.nombre} {user.apellido || ''}
            </p>
            <p className="text-xs text-brand-600 font-medium">{rolLabel[user.rol] || user.rol}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}