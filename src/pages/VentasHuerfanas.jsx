import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { normalizarEjecutivo } from '../utils/normalizarEjecutivo';

const GLOBAL_STYLE = `
  .vh-card { background: #fff; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #E2E8F0; padding: 20px; }
  .vh-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .vh-table thead tr { background: #F8FAFC; border-bottom: 2px solid #E2E8F0; }
  .vh-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; }
  .vh-table td { padding: 12px 16px; color: #334155; border-bottom: 1px solid #F1F5F9; }
  .vh-table tbody tr:hover { background: #F8FAFC; }
  .vh-select { width: 100%; padding: 8px; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 13px; }
  .vh-btn { padding: 6px 12px; background: #00897B; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
  .vh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('vh-styles')) return;
    const el = document.createElement('style');
    el.id = 'vh-styles';
    el.textContent = GLOBAL_STYLE;
    document.head.appendChild(el);
  }, []);
  return null;
}

function VentasHuerfanas() {
  const [ventas, setVentas] = useState([]);
  const [ejecutivos, setEjecutivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [reasingando, setReasignando] = useState(null);
  
  // Guardamos el ID del ejecutivo "SIN ASIGNAR"
  const [sinAsignarId, setSinAsignarId] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // 1. Fetch Ejecutivos (para el dropdown de reasignacion)
      const { data: execs } = await supabase.from('ejecutivos').select('*').order('nombre', { ascending: true });
      const activos = (execs || []).filter(e => e.activo !== false);
      
      const comodin = activos.find(e => e.nombre === '* SIN ASIGNAR *');
      if (comodin) {
        setSinAsignarId(comodin.id);
        
        // 2. Fetch Ventas asignadas a este comodin
        const { data: huerfanas } = await supabase
          .from('ventas')
          .select('*')
          .eq('ejecutivo_id', comodin.id)
          .order('fecha_ingreso', { ascending: false });
          
        setVentas(huerfanas || []);
      }
      
      // Lista limpia sin el comodin para el select
      setEjecutivos(activos.filter(e => e.nombre !== '* SIN ASIGNAR *'));
      
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleReasignar = async (ventaId, nuevoEjecutivoId) => {
    if (!nuevoEjecutivoId) return;
    setReasignando(ventaId);
    try {
      const { error } = await supabase
        .from('ventas')
        .update({ ejecutivo_id: nuevoEjecutivoId })
        .eq('id', ventaId);
        
      if (error) throw error;
      
      // Remover de la lista actual
      setVentas(prev => prev.filter(v => v.id !== ventaId));
    } catch (err) {
      alert("Error al reasignar: " + err.message);
    } finally {
      setReasignando(null);
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <StyleInjector />
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: '#0F172A' }}>Ventas Huérfanas</h1>
        <p style={{ margin: 0, color: '#64748B' }}>Ventas que no pudieron ser asignadas a ningún ejecutivo porque el RUT no coincidió. Reasígnalas manualmente aquí.</p>
      </div>

      <div className="vh-card">
        {cargando ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Cargando ventas huérfanas...</div>
        ) : ventas.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>No hay ventas huérfanas</div>
            <div style={{ color: '#64748B', marginTop: 4 }}>Todas las ventas están correctamente asignadas a sus ejecutivos.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="vh-table">
              <thead>
                <tr>
                  <th>N° Orden / Petición</th>
                  <th>Servicio</th>
                  <th>Fecha Ingreso</th>
                  <th>Cliente</th>
                  <th>Asignar a Ejecutivo Correcto</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600 }}>{v.numero_orden || v.peticion || '-'}</td>
                    <td>{v.tipo_servicio}</td>
                    <td>{v.fecha_ingreso || '-'}</td>
                    <td>{v.rut_cliente || '-'} {v.nombre_cliente ? `(${v.nombre_cliente})` : ''}</td>
                    <td style={{ width: 350 }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <select 
                          className="vh-select"
                          onChange={(e) => handleReasignar(v.id, e.target.value)}
                          disabled={reasingando === v.id}
                          defaultValue=""
                        >
                          <option value="" disabled>Seleccione un ejecutivo...</option>
                          {ejecutivos.map(ej => (
                            <option key={ej.id} value={ej.id}>
                              {ej.nombre} {ej.rut ? `(${ej.rut})` : ''} - {ej.tipo_contrato}
                            </option>
                          ))}
                        </select>
                        {reasingando === v.id && <span style={{ fontSize: 12, color: '#00897B', alignSelf: 'center' }}>Guardando...</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default VentasHuerfanas;
