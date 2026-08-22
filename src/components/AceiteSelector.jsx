import React from 'react';
import { Droplet } from 'lucide-react';

export default function AceiteSelector({ 
  tipoAceite, 
  setTipoAceite, 
  marcaAceite, 
  setMarcaAceite, 
  proximoKm, 
  tiempoEstimado 
}) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Droplet size={20} /> Configuración del Cambio de Aceite
        </h2>
        <span className="badge badge-warning">Próximo: {proximoKm.toLocaleString()} KM</span>
      </div>

      <div className="form-group">
        <label className="form-label">Marca del Aceite (Principales Marcas en Chile)</label>
        <select 
          className="form-select" 
          value={marcaAceite} 
          onChange={(e) => setMarcaAceite(e.target.value)}
        >
          <option value="Mobil1">Mobil 1</option>
          <option value="Castrol">Castrol</option>
          <option value="Liqui Moly">Liqui Moly</option>
          <option value="Shell">Shell Helix</option>
          <option value="Valvoline">Valvoline</option>
          <option value="Pennzoil">Pennzoil</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Tipo de Aceite y Frecuencia de Mantención</label>
        <select 
          className="form-select" 
          value={tipoAceite} 
          onChange={(e) => setTipoAceite(e.target.value)}
        >
          <option value="mineral">Aceite Mineral (Cambio cada 5.000 KM)</option>
          <option value="semisintetico">Aceite Semisintético (Cambio cada 10.000 KM)</option>
          <option value="sintetico">Aceite Sintético (Cambio cada 10.000 - 15.000 KM)</option>
        </select>
      </div>

      <div style={{ padding: '0.75rem', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', fontSize: '0.85rem' }}>
        <p style={{ color: '#94a3b8' }}>
          ⏱️ Tiempo Estimado de Servicio: <strong style={{ color: '#60a5fa' }}>{tiempoEstimado}</strong>
        </p>
      </div>
    </div>
  );
}
