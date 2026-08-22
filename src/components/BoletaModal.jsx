import React from 'react';
import { Printer } from 'lucide-react';

export default function BoletaModal({
  cliente,
  vehiculo,
  proximoKm,
  itemsDetalle,
  subtotal,
  iva,
  total,
  fallasIdentificadas,
  onClose
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        className="card print-area"
        style={{
          background: '#ffffff',
          color: '#000000',
          maxWidth: '650px',
          width: '100%',
          padding: '2.5rem',
          borderRadius: '8px'
        }}
      >
        {/* Encabezado Boleta */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>LUBRICENTRO LUBRIEXPRESS CHILE</h1>
          <p style={{ fontSize: '0.85rem' }}>RUT: 76.890.123-5 • Mantenimiento Automotriz de Calidad</p>
          <p style={{ fontSize: '0.85rem' }}>Av. Alemania 1020, Temuco, Chile • Teléfono: +56 45 221 4455</p>
          <h2 style={{ marginTop: '1rem', fontSize: '1.2rem', textDecoration: 'underline' }}>
            BOLETA ELECTRÓNICA N° 004921
          </h2>
        </div>

        {/* Datos Cliente / Vehículo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.9rem', marginBottom: '1.5rem', gap: '0.5rem' }}>
          <div><strong>Cliente:</strong> {cliente.nombre}</div>
          <div><strong>RUT:</strong> {cliente.rut}</div>
          <div><strong>Teléfono:</strong> {cliente.telefono}</div>
          <div><strong>Email:</strong> {cliente.email}</div>
          <div><strong>Vehículo:</strong> {vehiculo.marca} {vehiculo.modelo}</div>
          <div><strong>Patente:</strong> {vehiculo.patente}</div>
          <div><strong>KM Actual:</strong> {parseInt(vehiculo.kmActual || 0).toLocaleString()} KM</div>
          <div><strong>Próximo Cambio:</strong> {proximoKm.toLocaleString()} KM</div>
        </div>

        {/* Tabla Ítems */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
              <th style={{ padding: '6px 0' }}>Descripción del Servicio / Producto</th>
              <th style={{ textAlign: 'right', padding: '6px 0' }}>Total (CLP)</th>
            </tr>
          </thead>
          <tbody>
            {itemsDetalle.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px 0' }}>{item.nombre}</td>
                <td style={{ textAlign: 'right', padding: '6px 0' }}>${item.precio.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div style={{ textAlign: 'right', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          <p>Subtotal Neto: ${subtotal.toLocaleString()}</p>
          <p>IVA (19%): ${iva.toLocaleString()}</p>
          <h3 style={{ fontSize: '1.3rem', marginTop: '0.5rem' }}>Total: ${total.toLocaleString()} CLP</h3>
        </div>

        {/* Diagnostic Notes */}
        {fallasIdentificadas && (
          <div style={{ borderTop: '1px dashed #000', paddingTop: '0.75rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <strong>Observaciones y Diagnóstico Técnico:</strong>
            <p>{fallasIdentificadas}</p>
          </div>
        )}

        {/* Actions */}
        <div className="no-print" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn" style={{ background: '#e2e8f0', color: '#000' }} onClick={onClose}>
            Cerrar
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir Comprobante
          </button>
        </div>
      </div>
    </div>
  );
}
