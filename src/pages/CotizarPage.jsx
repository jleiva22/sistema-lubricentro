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

    // Si está autenticado, cargamos sus vehículos registrados
    useEffect(() => {
        if (isAuthenticated) {
            vehiculosAPI.getAll()
                .then(res => {
                    if (Array.isArray(res.data) && res.data.length > 0) {
                        setMisVehiculos(res.data);
                        // Seleccionar el primer vehículo por defecto
                        const primerVehiculo = res.data[0];
                        setSelectedVehiculoId(primerVehiculo.id);
                        setFormData(prev => ({
                            ...prev,
                            patente: primerVehiculo.patente,
                            marca: primerVehiculo.marca,
                            modelo: primerVehiculo.modelo,
                        }));
                    }
                })
                .catch(err => console.error(err));
        }
    }, [isAuthenticated]);

    // Al cambiar la selección del vehículo registrado
    const handleSelectVehiculo = (e) => {
        const vehiculoId = e.target.value;
        setSelectedVehiculoId(vehiculoId);

        if (vehiculoId === 'nuevo') {
            setFormData(prev => ({ ...prev, patente: '', marca: '', modelo: '' }));
        } else {
            const v = misVehiculos.find(item => item.id.toString() === vehiculoId.toString());
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