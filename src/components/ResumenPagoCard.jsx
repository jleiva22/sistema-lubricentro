import React from 'react';
import { Printer } from 'lucide-react';

export default function ResumenPagoCard({ subtotal, iva, total, onPagar }) {
  return (
    <div className="card" style={{ background: '#1e293b', border: '1px solid #3b82f6' }}>
      <h3 style={{ marginBottom: '1rem' }}>Resumen de la Orden</h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#94a3b8' }}>
        <span>Subtotal Neto:</span>
        <span>${subtotal.toLocaleString()} CLP</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#94a3b8' }}>
        <span>IVA (19%):</span>
        <span>${iva.toLocaleString()} CLP</span>
      </div>

      <hr style={{ borderColor: '#334155', margin: '0.75rem 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
        <span>Total a Pagar:</span>
        <span style={{ color: '#34d399' }}>${total.toLocaleString()} CLP</span>
      </div>

      <button
        className="btn btn-success"
        style={{ width: '100%', marginTop: '1.25rem' }}
        onClick={onPagar}
      >
        <Printer size={18} /> Pagar y Emitir Boleta
      </button>
    </div>
  );
}
