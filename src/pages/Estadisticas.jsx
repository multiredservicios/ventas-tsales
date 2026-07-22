import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { supabase } from '../supabaseClient';

/* ─── Estilos ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :root {
    --teal:        #00897B;
    --teal-dark:   #00695C;
    --teal-light:  #E0F2F1;
    --teal-mid:    #00796B;
    --amber:       #F59E0B;
    --green:       #16A34A;
    --green-light: #DCFCE7;
    --red:         #DC2626;
    --red-light:   #FEE2E2;
    --blue:        #1D4ED8;
    --blue-light:  #DBEAFE;
    --purple:      #7C3AED;
    --purple-light:#EDE9FE;
    --orange:      #EA580C;
    --orange-light:#FFEDD5;
    --gray-50:     #F8FAFC;
    --gray-100:    #F1F5F9;
    --gray-200:    #E2E8F0;
    --gray-400:    #94A3B8;
    --gray-600:    #475569;
    --gray-700:    #334155;
    --gray-900:    #0F172A;
    --shadow-sm:   0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.08);
    --shadow-md:   0 4px 6px -1px rgba(0,0,0,.08), 0 2px 4px -2px rgba(0,0,0,.06);
    --radius:      10px;
  }

  .est-wrapper * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

  /* ── Header ── */
  .est-header { margin-bottom: 28px; }
  .est-header h1 { font-size: 26px; font-weight: 700; color: var(--gray-900); margin: 0 0 4px; }
  .est-header p  { font-size: 14px; color: var(--gray-600); margin: 0; }

  /* ── Cards ── */
  .est-card {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
    padding: 20px;
    margin-bottom: 16px;
  }
  .est-card-title {
    font-size: 15px; font-weight: 700; color: var(--gray-900);
    margin: 0 0 16px; display: flex; align-items: center; gap: 8px;
  }

  /* ── KPI Grid ── */
  .est-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px; }
  .est-kpi {
    background: #fff;
    border-radius: var(--radius);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
    padding: 18px 20px;
    display: flex; align-items: center; gap: 14px;
  }
  .est-kpi-icon {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }
  .est-kpi-icon.teal   { background: var(--teal);   color: #fff; }
  .est-kpi-icon.green  { background: var(--green);  color: #fff; }
  .est-kpi-icon.red    { background: var(--red);    color: #fff; }
  .est-kpi-icon.blue   { background: var(--blue);   color: #fff; }
  .est-kpi-icon.purple { background: var(--purple); color: #fff; }
  .est-kpi-icon.orange { background: var(--orange); color: #fff; }
  .est-kpi-icon.amber  { background: var(--amber);  color: #fff; }
  .est-kpi-label { font-size: 12px; color: var(--gray-600); margin-bottom: 2px; }
  .est-kpi-value { font-size: 24px; font-weight: 700; color: var(--gray-900); line-height: 1; }
  .est-kpi-sub   { font-size: 11px; color: var(--gray-400); margin-top: 3px; }

  /* ── Tabs ── */
  .est-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: var(--gray-100); border-radius: 10px; padding: 4px; width: fit-content; }
  .est-tab {
    padding: 9px 22px; border-radius: 8px; border: none;
    font-size: 14px; font-weight: 600; cursor: pointer;
    color: var(--gray-600); background: transparent;
    transition: all .15s;
  }
  .est-tab:hover { color: var(--gray-900); background: var(--gray-200); }
  .est-tab.active { background: var(--teal); color: #fff; box-shadow: var(--shadow-sm); }

  /* ── Segment badge ── */
  .est-seg { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .est-seg.MASIVO { background: var(--orange-light); color: var(--orange); }
  .est-seg.PYME   { background: var(--green-light);  color: var(--green); }
  .est-seg.SSPP   { background: var(--blue-light);   color: var(--blue); }

  /* ── Ranking table ── */
  .est-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .est-table thead tr { background: var(--gray-50); border-bottom: 2px solid var(--gray-200); }
  .est-table thead th { padding: 11px 14px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: .05em; color: var(--gray-600); text-transform: uppercase; white-space: nowrap; }
  .est-table tbody tr { border-bottom: 1px solid var(--gray-100); transition: background .1s; }
  .est-table tbody tr:hover { background: var(--gray-50); }
  .est-table tbody td { padding: 11px 14px; color: var(--gray-700); }

  /* rank badge */
  .est-rank { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
  .est-rank.r1 { background: #FEF3C7; color: #92400E; }
  .est-rank.r2 { background: var(--gray-100); color: var(--gray-700); }
  .est-rank.r3 { background: #FEE2E2; color: #991B1B; }
  .est-rank.rn { background: var(--gray-100); color: var(--gray-600); font-size: 11px; }

  /* progress bar */
  .est-bar-track { background: var(--gray-100); border-radius: 4px; height: 6px; min-width: 80px; }
  .est-bar-fill  { height: 100%; border-radius: 4px; background: var(--teal); }
  .est-bar-fill.danger { background: var(--red); }

  /* ── Penalty badge ── */
  .est-pen { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .est-pen.high { background: var(--red-light); color: var(--red); }
  .est-pen.mid  { background: #FEF3C7; color: #92400E; }
  .est-pen.low  { background: var(--green-light); color: var(--green); }

  /* ── Two-col grid ── */
  .est-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  @media (max-width: 900px) { .est-two-col { grid-template-columns: 1fr; } }

  /* ── Spinner ── */
  .est-spinner { text-align: center; padding: 60px 0; color: var(--gray-400); font-size: 14px; }

  /* ── Empty ── */
  .est-empty { text-align: center; padding: 40px 0; color: var(--gray-400); font-size: 13px; }

  /* ── Canal tag ── */
  .est-canal { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
`;

/* ─── Colores para gráficos ─── */
const COLORS_BAR  = ['#00897B', '#0288D1', '#7B1FA2', '#F57C00', '#D32F2F', '#388E3C'];
const COLORS_PIE  = ['#00897B', '#0288D1', '#F57C00', '#7B1FA2', '#D32F2F'];

/* ─── Helpers ─── */
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

const penClass = (tasa) => {
  if (tasa >= 20) return 'high';
  if (tasa >= 10) return 'mid';
  return 'low';
};

const RankBadge = ({ n }) => {
  const cls = n === 1 ? 'r1' : n === 2 ? 'r2' : n === 3 ? 'r3' : 'rn';
  return <div className={`est-rank ${cls}`}>{n}</div>;
};

/* ── Tooltip custom ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#0F172A' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '2px 0', color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SUB-COMPONENTE: Estadísticas por segmento
═══════════════════════════════════════════════ */
function SeccionSegmento({ segmento, ventas }) {
  const ESTADO_PENALIZADO = ['CAIDA', 'RECHAZADA', 'PENALIZADA'];

  const total      = ventas.length;
  const penalizadas = ventas.filter(v => ESTADO_PENALIZADO.includes((v.estado || '').toUpperCase())).length;
  const activas    = ventas.filter(v => ['ACTIVA', 'APROBADA', 'VIGENTE'].includes((v.estado || '').toUpperCase())).length;
  const tasaPen    = pct(penalizadas, total);

  /* ── Top ejecutivos por ventas ── */
  const porEjecutivo = {};
  ventas.forEach(v => {
    const nombre = v.ejecutivos?.nombre || v.ejecutivo || 'Sin Asignar';
    const canal  = v.ejecutivos?.canal  || '—';
    const sup    = v.ejecutivos?.supervisor || '—';
    if (!porEjecutivo[nombre]) porEjecutivo[nombre] = { nombre, canal, supervisor: sup, ventas: 0, penalizadas: 0 };
    porEjecutivo[nombre].ventas++;
    if (ESTADO_PENALIZADO.includes((v.estado || '').toUpperCase())) porEjecutivo[nombre].penalizadas++;
  });

  const topVentas = Object.values(porEjecutivo)
    .sort((a, b) => b.ventas - a.ventas)
    .slice(0, 10);

  const topPenalizadas = Object.values(porEjecutivo)
    .filter(e => e.ventas >= 3)
    .sort((a, b) => (b.penalizadas / b.ventas) - (a.penalizadas / a.ventas))
    .slice(0, 10);

  /* ── Ventas por mes ── */
  const porMes = {};
  ventas.forEach(v => {
    const mes = (v.fecha_ingreso || v.created_at || '').substring(0, 7);
    if (!mes) return;
    if (!porMes[mes]) porMes[mes] = { mes, total: 0, penalizadas: 0, activas: 0 };
    porMes[mes].total++;
    if (ESTADO_PENALIZADO.includes((v.estado || '').toUpperCase())) porMes[mes].penalizadas++;
    else porMes[mes].activas++;
  });
  const datosMes = Object.values(porMes).sort((a, b) => a.mes.localeCompare(b.mes));

  /* ── Pie por estado ── */
  const porEstado = {};
  ventas.forEach(v => {
    const e = v.estado || 'SIN ESTADO';
    porEstado[e] = (porEstado[e] || 0) + 1;
  });
  const datosPie = Object.entries(porEstado).map(([name, value]) => ({ name, value }));

  const segColor = segmento === 'MASIVO' ? 'orange' : segmento === 'PYME' ? 'green' : 'blue';

  if (total === 0) {
    return (
      <div className="est-card">
        <div className="est-empty">📭 No hay ventas registradas para el segmento <strong>{segmento}</strong>.</div>
      </div>
    );
  }

  return (
    <>
      {/* KPIs del segmento */}
      <div className="est-kpi-grid">
        <div className="est-kpi">
          <div className={`est-kpi-icon ${segColor}`}>📋</div>
          <div>
            <div className="est-kpi-label">Total Ventas</div>
            <div className="est-kpi-value">{total}</div>
            <div className="est-kpi-sub">registros {segmento}</div>
          </div>
        </div>
        <div className="est-kpi">
          <div className="est-kpi-icon green">✓</div>
          <div>
            <div className="est-kpi-label">Activas / Vigentes</div>
            <div className="est-kpi-value">{activas}</div>
            <div className="est-kpi-sub">{pct(activas, total)}% del total</div>
          </div>
        </div>
        <div className="est-kpi">
          <div className="est-kpi-icon red">⚠</div>
          <div>
            <div className="est-kpi-label">Penalizadas</div>
            <div className="est-kpi-value">{penalizadas}</div>
            <div className="est-kpi-sub">{tasaPen}% del total</div>
          </div>
        </div>
        <div className="est-kpi">
          <div className="est-kpi-icon teal">👤</div>
          <div>
            <div className="est-kpi-label">Ejecutivos</div>
            <div className="est-kpi-value">{Object.keys(porEjecutivo).length}</div>
            <div className="est-kpi-sub">con ventas {segmento}</div>
          </div>
        </div>
      </div>

      {/* Gráfico de ventas por mes + Pie estados */}
      <div className="est-two-col">
        <div className="est-card">
          <div className="est-card-title">📈 Ventas por mes</div>
          {datosMes.length === 0 ? (
            <div className="est-empty">Sin datos de fecha</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={datosMes} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="activas"    stackId="a" fill="#00897B" name="Activas"     radius={[0,0,0,0]} />
                <Bar dataKey="penalizadas" stackId="a" fill="#DC2626" name="Penalizadas" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="est-card">
          <div className="est-card-title">🥧 Distribución por estado</div>
          {datosPie.length === 0 ? (
            <div className="est-empty">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={datosPie}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {datosPie.map((_, i) => <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top 10 por ventas */}
      <div className="est-card">
        <div className="est-card-title">🏆 Top 10 Ejecutivos por Ventas</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="est-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ejecutivo</th>
                <th>Canal</th>
                <th>Supervisor</th>
                <th>Ventas</th>
                <th>Penalizadas</th>
                <th>% Pen.</th>
                <th>Progreso</th>
              </tr>
            </thead>
            <tbody>
              {topVentas.length === 0 ? (
                <tr><td colSpan="8" className="est-empty">Sin datos</td></tr>
              ) : (
                topVentas.map((e, i) => {
                  const tasa = pct(e.penalizadas, e.ventas);
                  const maxV = topVentas[0]?.ventas || 1;
                  return (
                    <tr key={e.nombre}>
                      <td><RankBadge n={i + 1} /></td>
                      <td style={{ fontWeight: 600 }}>{e.nombre}</td>
                      <td>
                        <span className="est-canal" style={{ background: '#E0F2F1', color: '#00695C' }}>
                          {e.canal}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray-600)', fontSize: 12 }}>{e.supervisor}</td>
                      <td style={{ fontWeight: 700, color: 'var(--teal)' }}>{e.ventas}</td>
                      <td style={{ color: 'var(--red)', fontWeight: 600 }}>{e.penalizadas}</td>
                      <td>
                        <span className={`est-pen ${penClass(tasa)}`}>{tasa}%</span>
                      </td>
                      <td>
                        <div className="est-bar-track" style={{ minWidth: 90 }}>
                          <div className="est-bar-fill" style={{ width: `${pct(e.ventas, maxV)}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top penalizados */}
      <div className="est-card">
        <div className="est-card-title">🚨 Top Ejecutivos con Mayor Tasa de Penalización</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="est-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ejecutivo</th>
                <th>Canal</th>
                <th>Supervisor</th>
                <th>Penalizadas</th>
                <th>Tot. Ventas</th>
                <th>% Pen.</th>
                <th>Nivel</th>
              </tr>
            </thead>
            <tbody>
              {topPenalizadas.length === 0 ? (
                <tr><td colSpan="8" className="est-empty">Sin datos suficientes (mín. 3 ventas)</td></tr>
              ) : (
                topPenalizadas.map((e, i) => {
                  const tasa = pct(e.penalizadas, e.ventas);
                  return (
                    <tr key={e.nombre}>
                      <td><RankBadge n={i + 1} /></td>
                      <td style={{ fontWeight: 600 }}>{e.nombre}</td>
                      <td>
                        <span className="est-canal" style={{ background: '#E0F2F1', color: '#00695C' }}>
                          {e.canal}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray-600)', fontSize: 12 }}>{e.supervisor}</td>
                      <td style={{ color: 'var(--red)', fontWeight: 700 }}>{e.penalizadas}</td>
                      <td>{e.ventas}</td>
                      <td>
                        <span className={`est-pen ${penClass(tasa)}`}>{tasa}%</span>
                      </td>
                      <td>
                        <div className="est-bar-track" style={{ minWidth: 80 }}>
                          <div className={`est-bar-fill ${tasa >= 10 ? 'danger' : ''}`} style={{ width: `${Math.min(tasa * 2, 100)}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTE: Penalizaciones por Ejecutivo
   Muestra ventanas 3M y 6M para Fijo y Móvil
═══════════════════════════════════════════════ */
function SeccionEjecutivos({ ventas }) {
  const ESTADO_PENALIZADO = ['CAIDA', 'RECHAZADA', 'PENALIZADA'];
  const [busqueda, setBusqueda] = useState('');

  // Obtener todos los ejecutivos únicos con sus ventas
  const porEjecutivo = {};
  ventas.forEach(v => {
    const nombre = v.ejecutivos?.nombre || v.ejecutivo || 'Sin Asignar';
    const ejId   = v.ejecutivo_id || nombre;
    if (!porEjecutivo[ejId]) {
      porEjecutivo[ejId] = {
        nombre,
        canal: v.ejecutivos?.canal || '—',
        supervisor: v.ejecutivos?.supervisor || '—',
        ventasFijo:  [],
        ventasMovil: [],
      };
    }
    const tipo = (v.tipo_servicio || '').toLowerCase();
    if (tipo === 'fijo') {
      porEjecutivo[ejId].ventasFijo.push(v);
    } else {
      porEjecutivo[ejId].ventasMovil.push(v);
    }
  });

  const ejecutivos = Object.values(porEjecutivo)
    .filter(e => e.nombre !== 'Sin Asignar' && (e.ventasFijo.length + e.ventasMovil.length) > 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const ejecutivosFiltrados = busqueda.trim()
    ? ejecutivos.filter(e => e.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : ejecutivos;

  // Calcular ventana Nk para una lista de ventas
  const calcularVentana = (ventasEj, meses) => {
    // Obtener todos los periodos con ventas
    const periodos = new Set();
    ventasEj.forEach(v => {
      const p = (v.fecha_ingreso || '').substring(0, 7);
      if (p) periodos.add(p);
    });
    const periodosOrdenados = [...periodos].sort().slice(-meses);

    return periodosOrdenados.map(periodo => {
      const del_periodo = ventasEj.filter(v => (v.fecha_ingreso || '').startsWith(periodo));
      const cantidad    = del_periodo.length;
      const penalizadas = del_periodo.filter(v => ESTADO_PENALIZADO.includes((v.estado || '').toUpperCase())).length;
      const pct         = cantidad > 0 ? ((penalizadas / cantidad) * 100).toFixed(1) + '%' : '0.0%';
      return { periodo, cantidad, penalizadas, pct };
    });
  };

  // KPIs globales de ejecutivos
  const totalEjecutivos = ejecutivos.length;
  const conPenalizaciones = ejecutivos.filter(e => {
    const pen = [...e.ventasFijo, ...e.ventasMovil].filter(v => ESTADO_PENALIZADO.includes((v.estado || '').toUpperCase())).length;
    return pen > 0;
  }).length;

  if (ejecutivos.length === 0) {
    return (
      <div className="est-card">
        <div className="est-empty">📭 No hay datos de ejecutivos disponibles. Asegúrate de que las ventas estén vinculadas con ejecutivos.</div>
      </div>
    );
  }

  return (
    <>
      {/* KPIs resumen */}
      <div className="est-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 20 }}>
        <div className="est-kpi">
          <div className="est-kpi-icon teal">👤</div>
          <div>
            <div className="est-kpi-label">Ejecutivos con ventas</div>
            <div className="est-kpi-value">{totalEjecutivos}</div>
            <div className="est-kpi-sub">en el historial</div>
          </div>
        </div>
        <div className="est-kpi">
          <div className="est-kpi-icon red">⚠</div>
          <div>
            <div className="est-kpi-label">Con penalizaciones</div>
            <div className="est-kpi-value">{conPenalizaciones}</div>
            <div className="est-kpi-sub">{pct(conPenalizaciones, totalEjecutivos)}% del total</div>
          </div>
        </div>
        <div className="est-kpi">
          <div className="est-kpi-icon green">✓</div>
          <div>
            <div className="est-kpi-label">Sin penalizaciones</div>
            <div className="est-kpi-value">{totalEjecutivos - conPenalizaciones}</div>
            <div className="est-kpi-sub">{pct(totalEjecutivos - conPenalizaciones, totalEjecutivos)}% del total</div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="est-card" style={{ padding: '14px 20px', marginBottom: 16 }}>
        <input
          type="text"
          placeholder="🔍 Buscar ejecutivo por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0',
            borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif',
            color: '#0F172A', background: '#F8FAFC',
          }}
        />
      </div>

      {/* Lista de ejecutivos con sus tablas */}
      {ejecutivosFiltrados.map((ej, idx) => {
        const fijo3M  = calcularVentana(ej.ventasFijo,  3);
        const fijo6M  = calcularVentana(ej.ventasFijo,  6);
        const movil3M = calcularVentana(ej.ventasMovil, 3);
        const movil6M = calcularVentana(ej.ventasMovil, 6);

        const totalFijo  = ej.ventasFijo.length;
        const totalMovil = ej.ventasMovil.length;
        const penFijo    = ej.ventasFijo.filter(v  => ESTADO_PENALIZADO.includes((v.estado || '').toUpperCase())).length;
        const penMovil   = ej.ventasMovil.filter(v => ESTADO_PENALIZADO.includes((v.estado || '').toUpperCase())).length;

        const hayFijo  = totalFijo > 0;
        const hayMovil = totalMovil > 0;

        return (
          <div key={idx} className="est-card" style={{ marginBottom: 20 }}>
            {/* Header del ejecutivo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00897B, #00695C)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>
                  {ej.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{ej.nombre}</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    Canal: <strong>{ej.canal}</strong>
                    {ej.supervisor !== '—' && <> · Supervisor: <strong>{ej.supervisor}</strong></>}
                  </div>
                </div>
              </div>
              {/* Resumen rápido */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {hayFijo && (
                  <div style={{ textAlign: 'center', background: '#E3F2FD', borderRadius: 8, padding: '6px 14px' }}>
                    <div style={{ fontSize: 11, color: '#1565C0', fontWeight: 600 }}>FIJO</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1565C0' }}>{totalFijo}</div>
                    <div style={{ fontSize: 10, color: '#90CAF9' }}>{penFijo} pen.</div>
                  </div>
                )}
                {hayMovil && (
                  <div style={{ textAlign: 'center', background: '#F3E5F5', borderRadius: 8, padding: '6px 14px' }}>
                    <div style={{ fontSize: 11, color: '#6A1B9A', fontWeight: 600 }}>MÓVIL</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#6A1B9A' }}>{totalMovil}</div>
                    <div style={{ fontSize: 10, color: '#CE93D8' }}>{penMovil} pen.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Grid de tablas 3M y 6M */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Fijo 3M */}
              <TablaPenalizaciones
                titulo="📌 Penalizaciones Fijo 3M"
                datos={fijo3M}
                sinDatos={!hayFijo}
                ventana="N3"
              />

              {/* Móvil 3M */}
              <TablaPenalizaciones
                titulo="📌 Penalizaciones Móvil 3M"
                datos={movil3M}
                sinDatos={!hayMovil}
                ventana="N3"
              />

              {/* Fijo 6M */}
              <TablaPenalizaciones
                titulo="📌 Penalizaciones Fijo 6M"
                datos={fijo6M}
                sinDatos={!hayFijo}
                ventana="N6"
              />

              {/* Móvil 6M */}
              <TablaPenalizaciones
                titulo="📌 Penalizaciones Móvil 6M"
                datos={movil6M}
                sinDatos={!hayMovil}
                ventana="N6"
              />
            </div>
          </div>
        );
      })}

      {ejecutivosFiltrados.length === 0 && (
        <div className="est-card">
          <div className="est-empty">🔍 No se encontró ningún ejecutivo con ese nombre.</div>
        </div>
      )}
    </>
  );
}

/* ─── Tabla de penalizaciones por ventana ─── */
function TablaPenalizaciones({ titulo, datos, sinDatos, ventana }) {
  return (
    <div style={{
      border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', background: '#FAFAFA',
    }}>
      {/* Título */}
      <div style={{
        padding: '10px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0',
        fontWeight: 700, fontSize: 13, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {titulo}
      </div>

      {sinDatos || datos.length === 0 ? (
        <div style={{ padding: '20px 16px', textAlign: 'center', color: '#94A3B8', fontSize: 12, fontStyle: 'italic' }}>
          Sin datos en la ventana {ventana}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#F1F5F9' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#475569', fontWeight: 700, fontSize: 11 }}>Periodo</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', color: '#475569', fontWeight: 700, fontSize: 11 }}>Cantidad</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', color: '#475569', fontWeight: 700, fontSize: 11 }}>Penalizadas</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', color: '#475569', fontWeight: 700, fontSize: 11 }}>% Penalizadas</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((row, i) => {
              const tasaNum = parseFloat(row.pct);
              const color = tasaNum >= 20 ? '#DC2626' : tasaNum >= 10 ? '#D97706' : '#16A34A';
              return (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '9px 12px', color: '#334155', fontWeight: 600 }}>{row.periodo}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', color: '#334155' }}>{row.cantidad}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', color: row.penalizadas > 0 ? '#DC2626' : '#334155', fontWeight: row.penalizadas > 0 ? 700 : 400 }}>
                    {row.penalizadas}
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <span style={{
                      background: tasaNum >= 20 ? '#FEE2E2' : tasaNum >= 10 ? '#FEF3C7' : '#DCFCE7',
                      color, borderRadius: 20, padding: '2px 8px', fontWeight: 700, fontSize: 11,
                    }}>
                      {row.pct}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL: Estadisticas
═══════════════════════════════════════════════ */
function Estadisticas() {
  const [cargando, setCargando]     = useState(true);
  const [tabActivo, setTabActivo]   = useState('general');
  const [todasVentas, setTodasVentas] = useState([]);

  const ESTADO_PENALIZADO = ['CAIDA', 'RECHAZADA', 'PENALIZADA'];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);

    // Traer todas las ventas con datos del ejecutivo
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        ejecutivos ( nombre, rut, canal, supervisor, tipo_contrato )
      `)
      .order('fecha_ingreso', { ascending: false });

    if (!error && data) {
      setTodasVentas(data);
    }

    setCargando(false);
  };

  /* ── Filtros por segmento ── */
  const ventasPorSeg = (seg) =>
    todasVentas.filter(v => (v.segmento || '').toUpperCase() === seg);

  const masivo = ventasPorSeg('MASIVO');
  const pyme   = ventasPorSeg('PYME');
  const sspp   = ventasPorSeg('SSPP');

  /* ── KPIs globales ── */
  const total      = todasVentas.length;
  const penalizadas = todasVentas.filter(v => ESTADO_PENALIZADO.includes((v.estado || '').toUpperCase())).length;
  const activas    = todasVentas.filter(v => ['ACTIVA', 'APROBADA', 'VIGENTE'].includes((v.estado || '').toUpperCase())).length;
  const tasaGlobal = pct(penalizadas, total);

  /* ── Ventas por mes (global) ── */
  const porMesGlobal = {};
  todasVentas.forEach(v => {
    const mes = (v.fecha_ingreso || v.created_at || '').substring(0, 7);
    if (!mes) return;
    if (!porMesGlobal[mes]) porMesGlobal[mes] = { mes, MASIVO: 0, PYME: 0, SSPP: 0, total: 0 };
    const seg = (v.segmento || 'OTRO').toUpperCase();
    if (['MASIVO','PYME','SSPP'].includes(seg)) porMesGlobal[mes][seg]++;
    porMesGlobal[mes].total++;
  });
  const datosLinea = Object.values(porMesGlobal).sort((a, b) => a.mes.localeCompare(b.mes));

  /* ── Pie por segmento ── */
  const datosSegPie = [
    { name: 'MASIVO', value: masivo.length },
    { name: 'PYME',   value: pyme.length   },
    { name: 'SSPP',   value: sspp.length   },
  ].filter(d => d.value > 0);

  const TABS = [
    { id: 'general',    label: '📊 General'    },
    { id: 'masivo',     label: '🔶 Masivo'     },
    { id: 'pyme',       label: '🟢 Pyme'       },
    { id: 'sspp',       label: '🔵 SSPP'       },
    { id: 'ejecutivos', label: '👤 Ejecutivos' },
  ];

  return (
    <div className="est-wrapper">
      <style>{STYLES}</style>

      {/* Header */}
      <div className="est-header">
        <h1>📊 Estadísticas</h1>
        <p>Métricas generales y por segmento de toda la operación de ventas.</p>
      </div>

      {/* Tabs */}
      <div className="est-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`est-tab ${tabActivo === t.id ? 'active' : ''}`}
            onClick={() => setTabActivo(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="est-spinner">⏳ Cargando estadísticas…</div>
      ) : (
        <>
          {/* ════ GENERAL ════ */}
          {tabActivo === 'general' && (
            <>
              {/* KPIs globales */}
              <div className="est-kpi-grid">
                <div className="est-kpi">
                  <div className="est-kpi-icon teal">📋</div>
                  <div>
                    <div className="est-kpi-label">Total Ventas</div>
                    <div className="est-kpi-value">{total}</div>
                    <div className="est-kpi-sub">todos los segmentos</div>
                  </div>
                </div>
                <div className="est-kpi">
                  <div className="est-kpi-icon green">✓</div>
                  <div>
                    <div className="est-kpi-label">Activas / Vigentes</div>
                    <div className="est-kpi-value">{activas}</div>
                    <div className="est-kpi-sub">{pct(activas, total)}% del total</div>
                  </div>
                </div>
                <div className="est-kpi">
                  <div className="est-kpi-icon red">⚠</div>
                  <div>
                    <div className="est-kpi-label">Penalizadas</div>
                    <div className="est-kpi-value">{penalizadas}</div>
                    <div className="est-kpi-sub">Tasa: {tasaGlobal}%</div>
                  </div>
                </div>
                <div className="est-kpi">
                  <div className="est-kpi-icon orange">🔶</div>
                  <div>
                    <div className="est-kpi-label">Masivo</div>
                    <div className="est-kpi-value">{masivo.length}</div>
                    <div className="est-kpi-sub">{pct(masivo.length, total)}% del total</div>
                  </div>
                </div>
                <div className="est-kpi">
                  <div className="est-kpi-icon green">🏢</div>
                  <div>
                    <div className="est-kpi-label">Pyme</div>
                    <div className="est-kpi-value">{pyme.length}</div>
                    <div className="est-kpi-sub">{pct(pyme.length, total)}% del total</div>
                  </div>
                </div>
                <div className="est-kpi">
                  <div className="est-kpi-icon blue">🏛</div>
                  <div>
                    <div className="est-kpi-label">SSPP</div>
                    <div className="est-kpi-value">{sspp.length}</div>
                    <div className="est-kpi-sub">{pct(sspp.length, total)}% del total</div>
                  </div>
                </div>
              </div>

              {total === 0 ? (
                <div className="est-card">
                  <div className="est-empty">📭 No hay ventas cargadas aún. Sube archivos desde Ventas Fijo o Ventas Móvil.</div>
                </div>
              ) : (
                <div className="est-two-col">
                  {/* Línea por mes y segmento */}
                  <div className="est-card">
                    <div className="est-card-title">📈 Ventas por mes y segmento</div>
                    <ResponsiveContainer width="100%" height={230}>
                      <LineChart data={datosLinea} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line type="monotone" dataKey="MASIVO" stroke="#EA580C" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="PYME"   stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="SSPP"   stroke="#1D4ED8" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie por segmento */}
                  <div className="est-card">
                    <div className="est-card-title">🥧 Distribución por segmento</div>
                    {datosSegPie.length === 0 ? (
                      <div className="est-empty">Sin datos</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                          <Pie
                            data={datosSegPie}
                            cx="50%" cy="50%"
                            innerRadius={60} outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {datosSegPie.map((_, i) => (
                              <Cell key={i} fill={['#EA580C', '#16A34A', '#1D4ED8'][i] || COLORS_PIE[i]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              )}

              {/* Resumen comparativo */}
              {total > 0 && (
                <div className="est-card">
                  <div className="est-card-title">📊 Comparativo por segmento</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="est-table">
                      <thead>
                        <tr>
                          <th>Segmento</th>
                          <th>Total</th>
                          <th>Activas</th>
                          <th>Penalizadas</th>
                          <th>Tasa Pen.</th>
                          <th>Participación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { seg: 'MASIVO', ventas: masivo, cls: 'MASIVO' },
                          { seg: 'PYME',   ventas: pyme,   cls: 'PYME'   },
                          { seg: 'SSPP',   ventas: sspp,   cls: 'SSPP'   },
                        ].map(({ seg, ventas: sv, cls }) => {
                          const t  = sv.length;
                          const p  = sv.filter(v => ESTADO_PENALIZADO.includes((v.estado || '').toUpperCase())).length;
                          const a  = sv.filter(v => ['ACTIVA','APROBADA','VIGENTE'].includes((v.estado || '').toUpperCase())).length;
                          const tp = pct(p, t);
                          return (
                            <tr key={seg}>
                              <td><span className={`est-seg ${cls}`}>{seg}</span></td>
                              <td style={{ fontWeight: 700 }}>{t}</td>
                              <td style={{ color: 'var(--green)', fontWeight: 600 }}>{a}</td>
                              <td style={{ color: 'var(--red)', fontWeight: 600 }}>{p}</td>
                              <td><span className={`est-pen ${penClass(tp)}`}>{tp}%</span></td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div className="est-bar-track" style={{ minWidth: 100 }}>
                                    <div className="est-bar-fill" style={{ width: `${pct(t, total)}%` }} />
                                  </div>
                                  <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>{pct(t, total)}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ════ MASIVO ════ */}
          {tabActivo === 'masivo' && (
            <SeccionSegmento segmento="MASIVO" ventas={masivo} />
          )}

          {/* ════ PYME ════ */}
          {tabActivo === 'pyme' && (
            <SeccionSegmento segmento="PYME" ventas={pyme} />
          )}

          {/* ════ SSPP ════ */}
          {tabActivo === 'sspp' && (
            <SeccionSegmento segmento="SSPP" ventas={sspp} />
          )}

          {/* ════ EJECUTIVOS ════ */}
          {tabActivo === 'ejecutivos' && (
            <SeccionEjecutivos ventas={todasVentas} />
          )}
        </>
      )}
    </div>
  );
}

export default Estadisticas;