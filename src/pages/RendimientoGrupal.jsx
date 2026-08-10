import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ─── Estilos ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :root {
    --teal:        #00897B;
    --blue:        #1D4ED8;
    --orange:      #EA580C;
    --purple:      #7C3AED;
    --gray-50:     #F8FAFC;
    --gray-100:    #F1F5F9;
    --gray-200:    #E2E8F0;
    --gray-400:    #94A3B8;
    --gray-600:    #475569;
    --gray-700:    #334155;
    --gray-900:    #0F172A;
    --shadow-sm:   0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.08);
    --radius:      10px;
  }

  .rg-wrapper * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

  /* ── Header ── */
  .rg-header { margin-bottom: 28px; }
  .rg-header h1 { font-size: 26px; font-weight: 700; color: var(--gray-900); margin: 0 0 4px; }
  .rg-header p  { font-size: 14px; color: var(--gray-600); margin: 0; }

  /* ── Summary Cards ── */
  .rg-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .rg-card {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
    padding: 20px;
  }
  .rg-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .rg-card-title { font-size: 15px; font-weight: 700; color: var(--gray-700); }
  .rg-card-value { font-size: 32px; font-weight: 800; color: var(--gray-900); line-height: 1; }
  
  /* ── Table ── */
  .rg-table-container { overflow-x: auto; margin-top: 16px; }
  .rg-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .rg-table thead tr { background: var(--gray-50); border-bottom: 2px solid var(--gray-200); }
  .rg-table thead th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 700; color: var(--gray-600); text-transform: uppercase; }
  .rg-table tbody tr { border-bottom: 1px solid var(--gray-100); transition: background .1s; }
  .rg-table tbody tr:hover { background: var(--gray-50); }
  .rg-table tbody td { padding: 12px 16px; color: var(--gray-700); }

  /* ── Badges ── */
  .rg-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; }
  .rg-badge.contratado { background: #E0F2FE; color: #0369A1; }
  .rg-badge.freelance { background: #FEF3C7; color: #B45309; }
  .rg-badge.freelance-emp { background: #D1FAE5; color: #047857; }
  .rg-badge.otros { background: var(--gray-200); color: var(--gray-700); }

  .rg-spinner { text-align: center; padding: 60px 0; color: var(--gray-400); font-size: 14px; }
`;

export default function RendimientoGrupal() {
  const [cargando, setCargando] = useState(true);
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        id,
        ejecutivo_id,
        ejecutivo,
        ejecutivos ( nombre, tipo_contrato )
      `);

    if (!error && data) {
      setVentas(data);
    }
    setCargando(false);
  };

  /* ── Agrupación de datos ── */
  // 1. Agrupar ventas por ejecutivo
  const ventasPorEjecutivo = {};
  
  ventas.forEach(v => {
    // Si la venta tiene asociado el perfil real (ejecutivos), usamos esa info.
    // Si no, usamos el string suelto (v.ejecutivo).
    const nombre = v.ejecutivos?.nombre || v.ejecutivo || 'Sin Asignar';
    const tipoContrato = v.ejecutivos?.tipo_contrato || 'OTROS';

    if (!ventasPorEjecutivo[nombre]) {
      ventasPorEjecutivo[nombre] = {
        nombre,
        tipo_contrato: tipoContrato.toUpperCase(),
        totalVentas: 0
      };
    }
    ventasPorEjecutivo[nombre].totalVentas += 1;
  });

  // 2. Agrupar ejecutivos por tipo de contrato y sumar totales
  const grupos = {
    'CONTRATADO': { label: 'Contratados', ejecutivos: [], totalVentas: 0, color: 'var(--blue)', badgeClass: 'contratado' },
    'FREELANCE': { label: 'Freelance', ejecutivos: [], totalVentas: 0, color: 'var(--orange)', badgeClass: 'freelance' },
    'FREELANCE EMPRESA': { label: 'Freelance Empresa', ejecutivos: [], totalVentas: 0, color: 'var(--teal)', badgeClass: 'freelance-emp' },
    'OTROS': { label: 'Otros / Sin Especificar', ejecutivos: [], totalVentas: 0, color: 'var(--gray-600)', badgeClass: 'otros' }
  };

  Object.values(ventasPorEjecutivo).forEach(ej => {
    const tipo = ej.tipo_contrato;
    const grupo = grupos[tipo] || grupos['OTROS'];
    
    grupo.ejecutivos.push(ej);
    grupo.totalVentas += ej.totalVentas;
  });

  // Ordenar ejecutivos dentro de cada grupo por ventas (descendente)
  Object.values(grupos).forEach(g => {
    g.ejecutivos.sort((a, b) => b.totalVentas - a.totalVentas);
  });

  // Datos para el gráfico
  const chartData = Object.entries(grupos)
    .filter(([_, g]) => g.totalVentas > 0)
    .map(([key, g]) => ({
      name: g.label,
      Ventas: g.totalVentas,
      fill: g.color
    }));

  return (
    <div className="rg-wrapper" style={{ padding: '28px 32px', minHeight: '100vh', background: '#F8FAFC' }}>
      <style>{STYLES}</style>

      <div className="rg-header">
        <h1>👥 Rendimiento Grupal</h1>
        <p>Visualiza el acumulado de ventas separadas por tipo de contrato y sus ejecutivos.</p>
      </div>

      {cargando ? (
        <div className="rg-spinner">⏳ Cargando datos de rendimiento...</div>
      ) : (
        <>
          {/* Tarjetas resumen */}
          <div className="rg-summary-grid">
            {Object.entries(grupos).filter(([_, g]) => g.totalVentas > 0 || g.ejecutivos.length > 0).map(([key, g]) => (
              <div className="rg-card" key={key}>
                <div className="rg-card-header">
                  <span className="rg-card-title">{g.label}</span>
                  <span className={`rg-badge ${g.badgeClass}`}>{g.ejecutivos.length} personas</span>
                </div>
                <div className="rg-card-value" style={{ color: g.color }}>{g.totalVentas}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Ventas totales</div>
              </div>
            ))}
          </div>

          {/* Gráfico comparativo */}
          <div className="rg-card" style={{ marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--gray-800)' }}>Comparativa General</h3>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13 }} />
                  <Tooltip 
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="Ventas" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tablas por grupo */}
          {Object.entries(grupos).filter(([_, g]) => g.ejecutivos.length > 0).map(([key, g]) => (
            <div className="rg-card" key={'table-' + key} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--gray-800)' }}>Detalle: {g.label}</h3>
                <span className={`rg-badge ${g.badgeClass}`}>{g.totalVentas} ventas</span>
              </div>
              
              <div className="rg-table-container">
                <table className="rg-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60%' }}>Ejecutivo</th>
                      <th style={{ textAlign: 'right' }}>Total Ventas</th>
                      <th style={{ width: '20%', textAlign: 'center' }}>Porcentaje del grupo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.ejecutivos.map((ej, i) => {
                      const porcentaje = g.totalVentas > 0 ? ((ej.totalVentas / g.totalVentas) * 100).toFixed(1) : 0;
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{ej.nombre}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: g.color, fontSize: 14 }}>
                            {ej.totalVentas}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                              <div style={{ flex: 1, height: 6, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: g.color, width: `${porcentaje}%` }}></div>
                              </div>
                              <span style={{ fontSize: 12, color: 'var(--gray-500)', width: 36, textAlign: 'right' }}>
                                {porcentaje}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
