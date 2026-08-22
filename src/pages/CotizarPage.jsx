import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { vehiculosAPI, ordenesAPI } from '../services/api';

export default function CotizarPage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [misVehiculos, setMisVehiculos] = useState([]);
    const [selectedVehiculoId, setSelectedVehiculoId] = useState('nuevo');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
        patente: '',
        marca: '',
        modelo: '',
        servicioId: '',
        fecha: '',
        hora: '',
        observaciones: ''
    });

    useEffect(() => {
        if (isAuthenticated) {
            vehiculosAPI.getAll()
                .then(res => {
                    const vehiculos = res.data || res;
                    if (Array.isArray(vehiculos) && vehiculos.length > 0) {
                        setMisVehiculos(vehiculos);
                        const primerVehiculo = vehiculos[0];
                        setSelectedVehiculoId(primerVehiculo.id);
                        setFormData(prev => ({
                            ...prev,
                            patente: primerVehiculo.patente,
                            marca: primerVehiculo.marca,
                            modelo: primerVehiculo.modelo,
                        }));
                    }
                })
                .catch(err => console.error('Error al cargar vehículos:', err));
        }
    }, [isAuthenticated]);

    const handleSelectVehiculo = (e) => {
        const val = e.target.value;
        setSelectedVehiculoId(val);

        if (val === 'nuevo') {
            setFormData(prev => ({ ...prev, patente: '', marca: '', modelo: '' }));
        } else {
            const v = misVehiculos.find(item => item.id.toString() === val.toString());
            if (v) {
                setFormData(prev => ({
                    ...prev,
                    patente: v.patente,
                    marca: v.marca,
                    modelo: v.modelo,
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const fechaProgramada = formData.fecha && formData.hora
            ? `${formData.fecha}T${formData.hora}:00`
            : formData.fecha;

        const payload = {
            fecha_programada: fechaProgramada,
            servicio_ids: formData.servicioId ? [Number(formData.servicioId)] : [],
            observaciones_fallas: formData.observaciones || 'Reserva desde sitio web',

            ...(isAuthenticated
                ? {
                    cliente_id: user?.cliente_id || user?.id,
                    vehiculo_id: selectedVehiculoId !== 'nuevo' ? selectedVehiculoId : null,
                    ...(selectedVehiculoId === 'nuevo' && {
                        patente: formData.patente,
                        marca: formData.marca,
                        modelo: formData.modelo,
                    }),
                }
                : {
                    nombre: formData.nombre,
                    email: formData.email,
                    telefono: formData.telefono,
                    patente: formData.patente,
                    marca: formData.marca,
                    modelo: formData.modelo,
                }),
        };

        try {
            await ordenesAPI.createReservaExpress(payload);
            alert('¡Reserva agendada con éxito!');
            navigate('/dashboard');
        } catch (err) {
            console.error('Error al agendar reserva:', err);
            setError(err.response?.data?.message || 'No se pudo procesar la reserva.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        /* Tarjeta contenedora con sombra suave */
        <div className="max-w-xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Agendar Cita en Taller</h2>

            {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. SECCIÓN VEHÍCULO AUTENTICADO */}
                {isAuthenticated && misVehiculos.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Selecciona tu vehículo:
                        </label>
                        <select
                            value={selectedVehiculoId}
                            onChange={handleSelectVehiculo}
                            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            {misVehiculos.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.marca} {v.modelo} — ({v.patente})
                                </option>
                            ))}
                            <option value="nuevo">+ Usar otro vehículo</option>
                        </select>
                    </div>
                )}

                {/* VEHÍCULO NUEVO / INVITADO */}
                {(!isAuthenticated || selectedVehiculoId === 'nuevo') && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                            Datos del Vehículo
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Patente</label>
                                <input
                                    type="text"
                                    placeholder="ABCD12"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    value={formData.patente}
                                    onChange={e => setFormData({ ...formData, patente: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Marca</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Toyota"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    value={formData.marca}
                                    onChange={e => setFormData({ ...formData, marca: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Modelo</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Yaris"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    value={formData.modelo}
                                    onChange={e => setFormData({ ...formData, modelo: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. SECCIÓN DATOS PERSONALES */}
                {!isAuthenticated && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                            Tus Datos de Contacto
                        </h3>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                placeholder="Juan Pérez"
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    placeholder="+56 9 1234 5678"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    value={formData.telefono}
                                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. SECCIÓN FECHA Y SERVICIO */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">
                        Detalles del Agendamiento
                    </h3>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Servicio requerido</label>
                        <select
                            value={formData.servicioId}
                            onChange={e => setFormData({ ...formData, servicioId: e.target.value })}
                            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                            required
                        >
                            <option value="">-- Selecciona un servicio --</option>
                            <option value="1">Cambio de Aceite + Filtros</option>
                            <option value="2">Revisión de Frenos</option>
                            <option value="3">Mantención Preventiva</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Fecha</label>
                            <input
                                type="date"
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
                                value={formData.fecha}
                                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Hora</label>
                            <input
                                type="time"
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
                                value={formData.hora}
                                onChange={e => setFormData({ ...formData, hora: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Observaciones o síntomas</label>
                        <textarea
                            rows="3"
                            placeholder="Ej: Ruido al frenar, luces encendidas, etc."
                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            value={formData.observaciones}
                            onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                        />
                    </div>
                </div>

                {/* Botón Acción Principal */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
                >
                    {submitting ? 'Reservando...' : 'Confirmar Reserva'}
                </button>
            </form>
        </div>
    );
}