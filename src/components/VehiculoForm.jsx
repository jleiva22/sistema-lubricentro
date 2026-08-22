import React from 'react';
import { Car } from 'lucide-react';

export default function VehiculoForm({ vehiculo, setVehiculo }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehiculo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Car size={20} /> Datos del Vehículo
        </h2>
        <span className="badge badge-info">Patente: {vehiculo.patente || 'S/N'}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Patente / Dominio</label>
          <input
            type="text"
            name="patente"
            className="form-control"
            value={vehiculo.patente}
            onChange={handleChange}
            placeholder="Ej: KPR-421"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Marca</label>
          <input
            type="text"
            name="marca"
            className="form-control"
            value={vehiculo.marca}
            onChange={handleChange}
            placeholder="Ej: Toyota / Chevrolet"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Modelo / Año</label>
          <input
            type="text"
            name="modelo"
            className="form-control"
            value={vehiculo.modelo}
            onChange={handleChange}
            placeholder="Ej: RAV4 (2020)"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Kilometraje Actual (KM)</label>
          <input
            type="number"
            name="kmActual"
            className="form-control"
            value={vehiculo.kmActual}
            onChange={handleChange}
            placeholder="Ej: 45000"
          />
        </div>
      </div>
    </div>
  );
}
