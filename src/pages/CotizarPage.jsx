import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { vehiculosAPI, ordenesAPI } from '../services/api';

export default function CotizarPage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Estados de control del formulario
    const [misVehiculos, setMisVehiculos] = useState([]);
    const [selectedVehiculoId, setSelectedVehiculoId] = useState('nuevo');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Estado del formulario
    const [formData, setFormData] = useState({
        // Cliente (Autocompletado si inició sesión)
        nombre: user?.nombre || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
        // Vehículo
        patente: '',
        marca: '',
        modelo: '',
        // Reserva
        servicioId: '',
        fecha: '',
        hora: '',
        observaciones: ''
    });

    // Cargar vehículos del cliente autenticado
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

    // Cambio de vehículo en el selector
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

    // Envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        // Combinar fecha y hora en formato ISO/TIMESTAMP para backend
        const fechaProgramada = formData.fecha && formData.hora
            ? `${formData.fecha}T${formData.hora}:00`
            : formData.fecha || new Date();

        // Construcción del payload adaptado a createReservaExpress
        const payload = {
            fecha_programada: fechaProgramada,
            servicio_ids: formData.servicioId ? [Number(formData.servicioId)] : [],
            observaciones_fallas: formData.observaciones || 'Reserva desde sitio web',

            ...(isAuthenticated
                ? {
                    // Usuario autenticado
                    cliente_id: user?.cliente_id || user?.id,
                    vehiculo_id: selectedVehiculoId !== 'nuevo' ? selectedVehiculoId : null,
                    ...(selectedVehiculoId === 'nuevo' && {
                        patente: formData.patente,
                        marca: formData.marca,
                        modelo: formData.modelo,
                    }),
                }
                : {
                    // Usuario anónimo / invitado
                    nombre: formData.nombre,
                    email: formData.email,
                    telefono: formData.telefono,
                    patente: formData.patente,
                    marca: formData.marca,
                    modelo: formData.modelo,
                }),
        };

        try {
            // Llamada al endpoint express del backend
            await ordenesAPI.createReservaExpress(payload);
            alert('¡Reserva agendada con éxito!');
            navigate('/dashboard');
        } catch (err) {
            console.error('Error al agendar reserva:', err);
            setError(err.response?.data?.message || 'No se pudo procesar la reserva. Intenta nuevamente.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100 my-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Agendar Cita en Taller</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. SECCIÓN VEHÍCULO */}
                {isAuthenticated && misVehiculos.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Selecciona tu vehículo:
                        </label>
                        <select
                            value={selectedVehiculoId}
                            onChange={handleSelectVehiculo}
                            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500"
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

                {/* Formulario de vehículo si es nuevo o es invitado */}
                {(!isAuthenticated || selectedVehiculoId === 'nuevo') && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 border-b pb-2">Datos del Vehículo</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder="Patente (Ej: ABCD12)"
                                className="p-2.5 border border-slate-300 rounded-lg uppercase"
                                value={formData.patente}
                                onChange={e => setFormData({ ...formData, patente: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Marca"
                                className="p-2.5 border border-slate-300 rounded-lg"
                                value={formData.marca}
                                onChange={e => setFormData({ ...formData, marca: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Modelo"
                                className="p-2.5 border border-slate-300 rounded-lg"
                                value={formData.modelo}
                                onChange={e => setFormData({ ...formData, modelo: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* 2. SECCIÓN DATOS PERSONALES (Solo invitados) */}
                {!isAuthenticated && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 border-b pb-2">Tus Datos de Contacto</h3>
                        <input
                            type="text"
                            placeholder="Nombre Completo"
                            className="w-full p-2.5 border border-slate-300 rounded-lg"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            required
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="email"
                                placeholder="Correo Electrónico"
                                className="p-2.5 border border-slate-300 rounded-lg"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono (+569...)"
                                className="p-2.5 border border-slate-300 rounded-lg"
                                value={formData.telefono}
                                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* 3. SECCIÓN FECHA Y SERVICIO */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 border-b pb-2">Detalles del Agendamiento</h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Servicio requerido</label>
                        <select
                            value={formData.servicioId}
                            onChange={e => setFormData({ ...formData, servicioId: e.target.value })}
                            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
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
                            <label className="block text-sm font-medium text-slate-600 mb-1">Fecha</label>
                            <input
                                type="date"
                                className="w-full p-2.5 border border-slate-300 rounded-lg"
                                value={formData.fecha}
                                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Hora</label>
                            <input
                                type="time"
                                className="w-full p-2.5 border border-slate-300 rounded-lg"
                                value={formData.hora}
                                onChange={e => setFormData({ ...formData, hora: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Observaciones o síntomas</label>
                        <textarea
                            rows="3"
                            placeholder="Ej: Ruido al frenar, leve fugas, etc."
                            className="w-full p-2.5 border border-slate-300 rounded-lg"
                            value={formData.observaciones}
                            onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                    {submitting ? 'Reservando...' : 'Confirmar Reserva'}
                </button>
            </form>
        </div>
    );
}