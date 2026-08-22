import React from 'react';
import { User } from 'lucide-react';

export default function ClienteForm({ cliente, setCliente }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <User size={20} /> Datos del Cliente
        </h2>
        <span className="badge badge-success">Cliente Activo</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Nombre Completo</label>
          <input
            type="text"
            name="nombre"
            className="form-control"
            value={cliente.nombre}
            onChange={handleChange}
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <div className="form-group">
          <label className="form-label">RUT</label>
          <input
            type="text"
            name="rut"
            className="form-control"
            value={cliente.rut}
            onChange={handleChange}
            placeholder="Ej: 15.420.890-K"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Teléfono / WhatsApp</label>
          <input
            type="text"
            name="telefono"
            className="form-control"
            value={cliente.telefono}
            onChange={handleChange}
            placeholder="Ej: +56 9 8765 4321"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Correo Electrónico</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={cliente.email}
            onChange={handleChange}
            placeholder="juan.perez@email.com"
          />
        </div>
      </div>
    </div>
  );
}
