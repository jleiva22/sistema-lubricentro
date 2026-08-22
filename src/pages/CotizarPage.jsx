import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { vehiculosAPI, ordenesAPI } from '../services/api';

export default function CotizarPage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Lista de vehículos del cliente
    const [misVehiculos, setMisVehiculos] = useState([]);
    const [selectedVehiculoId, setSelectedVehiculoId] = useState('nuevo');

    // Estados de carga e interacción
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Estado del formulario
    const [formData, setFormData] = useState({
        // Datos cliente (precargados si está logueado)
        nombre: user?.nombre || '',
        email: user?.email || '',
        telefono: user?.telefono || '',
        // Datos vehículo
        patente: '',
        marca: '',
        modelo: '',
        // Cita
        servicioId: '',
        fecha: '',
        hora: '',
        observaciones: ''
    });

    // Cargar vehículos si el cliente está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            vehiculosAPI.getAll()
                .then(res => {
                    const vehiculos = Array.isArray(res) ? res : res?.data || [];
                    if (vehiculos.length > 0) {
                        setMisVehiculos(vehiculos);
                        const primerVehiculo = vehiculos[0];
                        setSelectedVehiculoId(primerVehiculo.id);
                        setFormData(prev => ({
                            ...prev,
                            patente: primerVehiculo.patente || '',
                            marca: primerVehiculo.marca || '',
                            modelo: primerVehiculo.modelo || '',
                        }));
                    }
                })
                .catch(err => console.error('Error al cargar vehículos:', err));
        }
    }, [isAuthenticated]);

    // Manejar cambio en selector de vehículos
    const handleSelectVehiculo = (e) => {
        const val = e.target.value;
        setSelectedVehiculoId(val);

        if (val === 'nuevo') {
            setFormData(prev => ({ ...prev, patente: '', marca: '', modelo: '' }));
        } else {
            const v = misVehiculos.find(item => item?.id?.toString() === val.toString());
            if (v) {
                setFormData(prev => ({
                    ...prev,
                    patente: v.patente || '',
                    marca: v.marca || '',
                    modelo: v.modelo || '',
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        // Formato de fecha para el backend (ISO / Timestamp)
        const fechaProgramada = formData.fecha && formData.hora
            ? `${formData.fecha}T${formData.hora}:00`
            : formData.fecha;

        // Construcción dinámica del payload para createReservaExpress
        const payload = {
            fecha_programada: fechaProgramada,
            servicio_ids: formData.servicioId ? [Number(formData.servicioId)] : [],
            observaciones_fallas: formData.observaciones || '',

            ...(isAuthenticated
                ? {
                    // Datos para usuario autenticado
                    cliente_id: user?.cliente_id || user?.id,
                    vehiculo_id: selectedVehiculoId !== 'nuevo' ? selectedVehiculoId : null,
                    ...(selectedVehiculoId === 'nuevo' && {
                        patente: formData.patente,
                        marca: formData.marca,
                        modelo: formData.modelo,
                    }),
                }
                : {
                    // Datos para usuario anónimo
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
            navigate('/dashboard');
        } catch (err) {
            console.error('Error al agendar reserva:', err);
            setError(err.response?.data?.message || 'No se pudo procesar la reserva');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
            {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {/* 1. SECCIÓN VEHÍCULO */}
            {isAuthenticated && misVehiculos.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-semibold mb-2">Selecciona tu vehículo:</label>
                    <select
                        value={selectedVehiculoId}
                        onChange={handleSelectVehiculo}
                        className="w-full p-2.5 rounded-lg border border-slate-300"
                    >
                        {misVehiculos.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.marca} {v.modelo} - {v.patente}
                            </option>
                        ))}
                        <option value="nuevo">+ Usar un vehículo distinto</option>
                    </select>
                </div>
            )}

            {/* Si no tiene vehículo seleccionado o elige "nuevo", muestra los inputs de marca/patente */}
            {(!isAuthenticated || selectedVehiculoId === 'nuevo') && (
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800">Datos del Vehículo</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Patente"
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

            {/* 2. SECCIÓN DATOS PERSONALES (Solo se pide si NO está logueado) */}
            {!isAuthenticated && (
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800">Tus Datos de Contacto</h3>
                    <input
                        type="text"
                        placeholder="Nombre Completo"
                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                        value={formData.nombre}
                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            className="w-full p-2.5 border border-slate-300 rounded-lg"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Teléfono"
                            className="w-full p-2.5 border border-slate-300 rounded-lg"
                            value={formData.telefono}
                            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* 3. SECCIÓN FECHA Y SERVICIO (Siempre visible) */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-800">Detalles de la Reserva</h3>
                <div>
                    <select
                        value={formData.servicioId}
                        onChange={e => setFormData({ ...formData, servicioId: e.target.value })}
                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                        required
                    >
                        <option value="">-- Selecciona un servicio --</option>
                        <option value="1">Cambio de Aceite + Filtros</option>
                        <option value="2">Revisión de Frenos</option>
                        <option value="3">Mantención Preventiva</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="date"
                        className="p-2.5 border border-slate-300 rounded-lg"
                        value={formData.fecha}
                        onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                        required
                    />
                    <input
                        type="time"
                        className="p-2.5 border border-slate-300 rounded-lg"
                        value={formData.hora}
                        onChange={e => setFormData({ ...formData, hora: e.target.value })}
                        required
                    />
                </div>
                <textarea
                    rows="3"
                    placeholder="Observaciones o comentarios adicionales..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    value={formData.observaciones}
                    onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
            >
                {submitting ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
        </form>
    );
}