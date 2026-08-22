import React from 'react';
import { Droplet, Clock, ShieldAlert } from 'lucide-react';

export default function Header({ backendConnected, onAbrirBoleta }) {
  return (
    <header className="navbar no-print">
      <div className="brand">
        <Droplet className="brand-icon" size={28} />
        <span>LubriExpress Pro</span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span className={`badge ${backendConnected ? 'badge-success' : 'badge-warning'}`}>
          {backendConnected ? '🟢 Backend Conectado' : '🟡 Modo Local / Standalone'}
        </span>

        <span className="badge badge-info">
          <Clock size={14} inline="true" /> Taller Abierto
        </span>

        <button className="btn btn-primary" onClick={onAbrirBoleta}>
          Generar Boleta / Comprobante
        </button>
      </div>
    </header>
  );
}
