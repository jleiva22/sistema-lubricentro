import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ServiciosChecklist({ serviciosExtra, setServiciosExtra }) {
  const toggleServicio = (key) => {
    setServiciosExtra((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <ShieldCheck size={20} /> Revisiones y Mantenimiento Preventivo
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={serviciosExtra.filtroAceite}
            onChange={() => toggleServicio('filtroAceite')}
          />
          <span>Filtro de Aceite</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={serviciosExtra.filtroAire}
            onChange={() => toggleServicio('filtroAire')}
          />
          <span>Filtro de Aire / Cabina</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={serviciosExtra.revisionFluidos}
            onChange={() => toggleServicio('revisionFluidos')}
          />
          <span>Control de Fluidos</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={serviciosExtra.revisionNeumaticos}
            onChange={() => toggleServicio('revisionNeumaticos')}
          />
          <span>Neumáticos</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={serviciosExtra.revisionFrenos}
            onChange={() => toggleServicio('revisionFrenos')}
          />
          <span>Pastillas de Freno</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={serviciosExtra.revisionEscobillas}
            onChange={() => toggleServicio('revisionEscobillas')}
          />
          <span>Luces y Escobillas</span>
        </label>
      </div>
    </div>
  );
}
