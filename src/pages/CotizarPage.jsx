

import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { vehiculosAPI } from '../services/api';

export default function CotizarPage() {
    const { user, isAuthenticated } = useAuth();

    // Lista de vehículos del cliente
    const [misVehiculos, setMisVehiculos] = useState([]);
    const [selectedVehiculoId, setSelectedVehiculoId] = useState('nuevo');

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
        hora: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        // Construcción dinámica del payload
        const payload = {
            servicio_id: formData.servicioId,
            fecha_reserva: formData.fecha,
            hora_reserva: formData.hora,
            observaciones: formData.observaciones || '',

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
            await reservasAPI.create(payload);
            navigate('/dashboard'); // O pantalla de confirmación
        } catch (err) {
            console.error('Error al agendar reserva:', err);
            setError(err.response?.data?.message || 'No se pudo procesar la reserva');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="max-w-xl mx-auto space-y-6">
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
            {selectedVehiculoId === 'nuevo' && (
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Patente"
                        value={formData.patente}
                        onChange={e => setFormData({ ...formData, patente: e.target.value })}
                    />
                    {/* ... inputs de marca y modelo */}
                </div>
            )}

            {/* 2. SECCIÓN DATOS PERSONALES (Solo se pide si NO está logueado) */}
            {!isAuthenticated && (
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800">Tus Datos de Contacto</h3>
                    <input
                        type="text"
                        placeholder="Nombre Completo"
                        value={formData.nombre}
                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
            )}

            {/* 3. SECCIÓN FECHA Y SERVICIO (Siempre visible) */}
            {/* ... fecha, hora y selección de servicio ... */}
        </form>
    );
}