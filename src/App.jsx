import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import NuevaOrdenPage from './pages/NuevaOrdenPage';
import BoletaPreviewPage from './pages/BoletaPreviewPage';
import ClientesPage from './pages/ClientesPage';
import NuevoClientePage from './pages/NuevoClientePage';
import VehiculosPage from './pages/VehiculosPage';
import NuevoVehiculoPage from './pages/NuevoVehiculoPage';
import CatalogPage from './pages/CatalogPage';
import NuevoServicioPage from './pages/NuevoServicioPage';
import BoletasPage from './pages/BoletasPage';
import UsuariosPage from './pages/UsuariosPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas Protegidas General */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/ordenes" element={<OrdersPage />} />
            <Route path="/ordenes/nueva" element={<NuevaOrdenPage />} />
            <Route path="/boletas/preview" element={<BoletaPreviewPage />} />
            <Route path="/vehiculos" element={<VehiculosPage />} />
            <Route path="/vehiculos/nuevo" element={<NuevoVehiculoPage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
          </Route>

          {/* Rutas Exclusivas Administrador & Mecánico */}
          <Route element={<ProtectedRoute roles={['administrador', 'mecanico']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/boletas" element={<BoletasPage />} />
          </Route>

          {/* Rutas Exclusivas Solo Administrador */}
          <Route element={<ProtectedRoute roles={['administrador']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/clientes/nuevo" element={<NuevoClientePage />} />
            <Route path="/catalogo/nuevo" element={<NuevoServicioPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
