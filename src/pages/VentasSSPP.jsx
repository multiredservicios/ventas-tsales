import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .sspp-wrapper { padding: 28px 32px; background: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
  .sspp-header { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
  .sspp-header h1 { font-size: 26px; font-weight: 800; color: #0F172A; margin: 0; }
  .sspp-header p { font-size: 14px; color: #64748B; margin: 4px 0 0 0; }

  .sspp-card { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; border: 1px solid #E2E8F0; }

  /* ─── Tabla Cierre (pivot) ─── */
  .sspp-table-container { overflow-x: auto; max-width: 100%; border-radius: 8px; border: 1px solid #E2E8F0; }
  .sspp-table { width: 100%; border-collapse: collapse; font-size: 13px; white-space: nowrap; }
  .sspp-table thead tr { background: #0F172A; }
  .sspp-table thead th { padding: 12px 18px; text-align: right; color: #fff; font-weight: 700; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; }
  .sspp-table thead th:first-child { text-align: left; }
  .sspp-table tbody td { padding: 10px 18px; border-bottom: 1px solid #F1F5F9; color: #334155; text-align: right; }
  .sspp-table tbody td:first-child { text-align: left; }

  /* Filas supervisor (bold, fondo azul oscuro) */
  .sspp-table tr.row-supervisor td { background: #EFF6FF; font-weight: 700; color: #1E40AF; }
  /* Filas empresa (indent, fondo blanco) */
  .sspp-table tr.row-empresa td { background: #fff; color: #64748B; font-size: 12px; }
  .sspp-table tr.row-empresa td:first-child { padding-left: 36px; }
  /* Hover */
  .sspp-table tbody tr:hover td { background: #F0F9FF !important; }

  /* Valor clickeable */
  .val-clickable {
    cursor: pointer; color: #2563EB; font-weight: 700;
    text-decoration: underline dotted; text-underline-offset: 3px;
    transition: color .15s;
  }
  .val-clickable:hover { color: #1D4ED8; }
  .val-zero { color: #CBD5E1; }

  /* Fila TOTAL */
  .sspp-table tr.row-total td { background: #0F172A; color: #F8FAFC; font-weight: 800; font-size: 13px; border-top: 2px solid #2563EB; }

  /* Badges Categoría */
  .badge-cat { padding: 3px 9px; border-radius: 20px; font-weight: 700; font-size: 11px; display: inline-block; }
  .cat-oro    { background: #FEF9C3; color: #854D0E; }
  .cat-plata  { background: #E2E8F0; color: #475569; }
  .cat-bronce { background: #FFEDD5; color: #9A3412; }

  /* ─── Botones ─── */
  .btn-amber  { background: #F59E0B; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: .2s; }
  .btn-amber:hover  { filter: brightness(1.1); }
  .btn-blue   { background: #2563EB; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: .2s; }
  .btn-blue:hover   { filter: brightness(1.1); }
  .btn-outline { background: white; color: #475569; border: 1px solid #CBD5E1; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: .2s; }
  .btn-outline:hover { background: #F1F5F9; }
  .btn-icon { background: none; border: none; cursor: pointer; color: #94A3B8; font-size: 16px; padding: 4px 6px; border-radius: 6px; transition: .12s; }
  .btn-icon:hover { background: #F1F5F9; color: #334155; }

  /* ─── Modal detalle ─── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(15,23,42,.55); backdrop-filter: blur(3px);
    display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
  }
  .modal-box {
    background: #fff; border-radius: 14px; width: 95vw; max-width: 1200px;
    max-height: 85vh; display: flex; flex-direction: column;
    box-shadow: 0 24px 48px rgba(0,0,0,.22); overflow: hidden;
  }
  .modal-header {
    padding: 18px 24px; border-bottom: 1px solid #E2E8F0;
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  }
  .modal-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #0F172A; }
  .modal-header p { margin: 2px 0 0; font-size: 12px; color: #64748B; }
  .modal-body { overflow-y: auto; flex: 1; }

  /* Tabla detalle */
  .det-table { width: 100%; border-collapse: collapse; font-size: 12px; white-space: nowrap; }
  .det-table thead tr { background: #1E293B; position: sticky; top: 0; z-index: 1; }
  .det-table thead th { padding: 10px 14px; color: #94A3B8; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; text-align: left; }
  .det-table tbody td { padding: 9px 14px; border-bottom: 1px solid #F1F5F9; color: #334155; }
  .det-table tbody tr:hover { background: #F8FAFC; }

  /* Chips */
  .chip { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
  .chip-oro    { background: #FEF9C3; color: #854D0E; }
  .chip-plata  { background: #E2E8F0; color: #475569; }
  .chip-bronce { background: #FFEDD5; color: #9A3412; }
  .chip-default { background: #F1F5F9; color: #64748B; }

  .nav-val { font-family: monospace; font-weight: 600; color: #16A34A; }

  /* Preview banner */
  .preview-banner {
    background: #FFFBEB; color: #92400E; border-bottom: 1px solid #FDE68A;
    padding: 10px 20px; font-size: 13px; font-weight: 600; border-radius: 12px 12px 0 0;
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
  }
`;

/* ─── Helpers ─── */
const fmt = (n) => {
  if (!n && n !== 0) return '—';
  return new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
};

const chipCat = (cat = '') => {
  const c = cat.toLowerCase();
  if (c.includes('oro'))    return 'chip chip-oro';
  if (c.includes('plata'))  return 'chip chip-plata';
  if (c.includes('bronce')) return 'chip chip-bronce';
  return 'chip chip-default';
};

const badgeCat = (cat = '') => {
  const c = cat.toLowerCase();
  if (c.includes('oro'))    return 'badge-cat cat-oro';
  if (c.includes('plata'))  return 'badge-cat cat-plata';
  if (c.includes('bronce')) return 'badge-cat cat-bronce';
  return 'badge-cat';
};

const fmtDate = (val) => {
  if (!val) return '—';
  if (val instanceof Date) return val.toLocaleDateString('es-CL');
  if (typeof val === 'number') {
    // Excel serial date
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return d.toLocaleDateString('es-CL');
  }
  return String(val).split('T')[0];
};

/* ─── Parsers ─── */
function parseCierre(wb) {
  const wsName = wb.SheetNames.includes('Cierre') ? 'Cierre' : wb.SheetNames[0];
  const ws = wb.Sheets[wsName];
  const matriz = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  // Fila 3 => headers: ASESOR, Bronce, Oro, Plata, TOTAL
  // Fila 4+ => datos
  const rows = [];
  let currentSup = null;

  for (let i = 4; i < matriz.length; i++) {
    const fila = matriz[i];
    if (!fila || !fila[0]) continue;
    const nombre = String(fila[0]).trim();
    if (!nombre || nombre.toUpperCase() === 'TOTAL') continue;

    const bronce = fila[1] ? Number(fila[1]) : 0;
    const oro    = fila[2] ? Number(fila[2]) : 0;
    const plata  = fila[3] ? Number(fila[3]) : 0;
    const total  = fila[4] ? Number(fila[4]) : 0;

    // Heurística: si Bronce+Oro+Plata ≠ total significa que es supervisor (tiene sub-filas)
    // Más simple: vemos si la siguiente fila(s) tienen el mismo total sin nombre de supervisor
    // Usamos indent: en el Excel la fila supervisora tiene valor en col 0 y las empresas son sub-indent
    // Pero sheet_to_json no preserva indent. Usaremos la col 5 (segunda tabla NAV) para distinguir.
    // Mejor enfoque: si total > 0 y bronce/oro/plata suman ≈ total → supervisor (puede tener clientes abajo)
    // Los clientes (empresas) también tienen valores. Distinguimos por si el nombre anterior era supervisor.
    // Miramos: un supervisor tiene filas hijas con nombres de empresa que suman su total.
    rows.push({ nombre, bronce, oro, plata, total });
  }

  // Identificar supervisores vs empresas:
  // Supervisores son los que tienen al menos una empresa debajo cuyo total coincide
  // Más simple: en la estructura del Excel, los supervisores son filas donde la SIGUIENTE fila
  // tiene valores que se incluyen en el total del supervisor.
  // Podemos simplificar: un supervisor es una fila cuyo nombre aparece en la hoja Maestro como SUPERVISOR.
  // Lo haremos al mezclar con Maestro. Por ahora devolvemos flat.
  return rows;
}

function parseMaestro(wb) {
  const ws = wb.Sheets['Maestro'];
  if (!ws) return [];
  const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return raw.map(r => ({
    periodo:              r['periodo'] || '',
    identificador_opp:    r['IDENTIFICADOR_OPP'] || '',
    asesor:               String(r['ASESOR'] || '').trim(),
    supervisor:           String(r['SUPERVISOR'] || '').trim(),
    categoria:            r['CATEGORIA'] || '',
    ponderacion:          r['PONDERACION'] || '',
    nav_ponderado:        r['NAV_PONDERADO'] || 0,
    oportunidad:          r['OPORTUNIDAD'] || '',
    rut_cliente:          r['RUT_CLIENTE'] || '',
    nombre_cliente:       r['NOMBRE_CLIENTE'] || '',
    fecha_creacion:       r['FECHA_CREACION'] || '',
    fecha_cierre:         r['FECHA_AUTOMATICA_CIERRE'] || '',
    producto_nivel_1:     r['PRODUCTO_NIVEL_1'] || '',
    producto_nivel_2:     r['PRODUCTO_NIVEL_2'] || '',
    producto_nivel_3:     r['PRODUCTO_NIVEL_3'] || '',
    producto:             r['PRODUCTO'] || '',
    duracion_contrato:    r['DURACION_CONTRATO'] || '',
    nav:                  r['NAV'] || 0,
    rut_creador:          r['RUT_CREADOR_OPP'] || '',
    familia_empresa:      r['familia_empresa'] || '',
    canal:                r['canal'] || '',
    segmento:             r['segmento propuesto'] || '',
    agrupacion:           r['Agrupacion_tsales'] || '',
    fav_uf:               r['FAV en UF'] || 0,
  }));
}

/* ─── Componente ─── */
function VentasSSPP() {
  const [cierreRows, setCierreRows]   = useState([]);   // flat rows del pivot
  const [maestroRows, setMaestroRows] = useState([]);   // detalle completo
  const [supervisores, setSupervisores] = useState([]); // lista de supervisores únicos

  const [datosBD, setDatosBD]       = useState({ cierre: [], maestro: [] });
  const [archivo, setArchivo]       = useState(null);
  const [modalCarga, setModalCarga] = useState(false);
  const [preview, setPreview]       = useState(false);

  // Modal detalle
  const [detalle, setDetalle]       = useState(null);  // { nombre, tipo: 'supervisor'|'empresa', columna }

  useEffect(() => { cargarDatosBD(); }, []);

  const cargarDatosBD = async () => {
    const [{ data: cierre }, { data: maestro }] = await Promise.all([
      supabase.from('cierre_sspp_pivot').select('*').order('nombre'),
      supabase.from('cierre_sspp_detalle').select('*').order('asesor'),
    ]);
    setDatosBD({ cierre: cierre || [], maestro: maestro || [] });
  };

  const handleFileSelect = (e) => setArchivo(e.target.files[0]);

  const procesarArchivo = () => {
    if (!archivo) return alert('Sube un archivo primero.');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const cRows = parseCierre(wb);
        const mRows = parseMaestro(wb);

        // Detectar supervisores: nombres que aparecen como SUPERVISOR en Maestro
        const supSet = new Set(mRows.map(r => r.supervisor.toUpperCase()));
        setCierreRows(cRows.map(r => ({ ...r, esSupervisor: supSet.has(r.nombre.toUpperCase()) })));
        setMaestroRows(mRows);
        setSupervisores([...supSet]);
        setPreview(true);
        setModalCarga(false);
      } catch (err) {
        alert('Error procesando el Excel: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(archivo);
  };

  const guardarEnBD = async () => {
    // Guardar pivot
    const pivotData = cierreRows.map(r => ({
      nombre: r.nombre, es_supervisor: r.esSupervisor,
      bronce: r.bronce, oro: r.oro, plata: r.plata, total: r.total,
    }));
    // Guardar detalle
    const detalleData = maestroRows.map(r => ({ ...r }));

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from('cierre_sspp_pivot').insert(pivotData),
      supabase.from('cierre_sspp_detalle').insert(detalleData),
    ]);

    if (e1 || e2) {
      alert('Error al guardar: ' + (e1?.message || e2?.message));
    } else {
      alert('¡Cierre SSPP guardado con éxito!');
      setCierreRows([]); setMaestroRows([]); setPreview(false);
      cargarDatosBD();
    }
  };

  /* ─── Abrir detalle ─── */
  const abrirDetalle = (nombre, esSupervisor, columna) => {
    const fuente = maestroRows.length > 0 ? maestroRows : datosBD.maestro;
    let filas;
    if (esSupervisor) {
      filas = fuente.filter(r => r.supervisor.toUpperCase() === nombre.toUpperCase());
    } else {
      filas = fuente.filter(r => r.nombre_cliente.toUpperCase() === nombre.toUpperCase()
                               || r.asesor.toUpperCase() === nombre.toUpperCase());
    }
    // Si columna específica (bronce/oro/plata), filtrar por categoría
    if (columna && columna !== 'total') {
      filas = filas.filter(r => r.categoria.toLowerCase().includes(columna));
    }
    setDetalle({ nombre, esSupervisor, columna, filas });
  };

  /* ─── Datos a mostrar ─── */
  const pivotRaw = cierreRows.length > 0 ? cierreRows : datosBD.cierre;

  // Mostrar SOLO asesores: excluir supervisores y excluir filas de empresas cliente
  // Los asesores son filas que NO son supervisor y cuyo nombre coincide con un ASESOR del Maestro
  const fuente = maestroRows.length > 0 ? maestroRows : datosBD.maestro;
  const asesoresSet = new Set(fuente.map(r => r.asesor.toUpperCase()));
  const pivot = pivotRaw.filter(r => !r.esSupervisor && asesoresSet.has(r.nombre.toUpperCase()));

  // Calcular totales para fila final (solo sobre asesores)
  const totales = pivot.reduce((acc, r) => ({
    bronce: acc.bronce + (r.bronce || 0),
    oro:    acc.oro    + (r.oro    || 0),
    plata:  acc.plata  + (r.plata  || 0),
    total:  acc.total  + (r.total  || 0),
  }), { bronce: 0, oro: 0, plata: 0, total: 0 });

  const ValCell = ({ valor, nombre, esSupervisor, columna }) => {
    if (!valor) return <span className="val-zero">—</span>;
    return (
      <span className="val-clickable" onClick={() => abrirDetalle(nombre, esSupervisor, columna)}>
        {fmt(valor)}
      </span>
    );
  };

  return (
    <div className="sspp-wrapper">
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div className="sspp-header">
        <div>
          <h1>🏛️ Cierre Comisional SSPP</h1>
          <p>Ventas NAV en UF por supervisor y asesor. Haz clic en cualquier valor para ver el detalle.</p>
        </div>
        <button className="btn-amber" onClick={() => setModalCarga(true)}>⬆ Cargar Cierre Excel</button>
      </div>

      {/* ── Preview banner ── */}
      {preview && cierreRows.length > 0 && (
        <div className="preview-banner" style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #FDE68A' }}>
          <span>⚠️ Previsualizando {cierreRows.length} filas y {maestroRows.length} registros de detalle.</span>
          <button className="btn-blue" onClick={guardarEnBD}>💾 Guardar en BD</button>
        </div>
      )}

      {/* ── Tabla Cierre ── */}
      <div className="sspp-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Suma de FAV en UF</span>
          <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 4 }}>— Haz clic en un valor para ver el detalle</span>
        </div>
        <div className="sspp-table-container">
          <table className="sspp-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '40%' }}>ASESOR</th>
                <th>BRONCE</th>
                <th>ORO</th>
                <th>PLATA</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {pivot.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No hay registros. Carga un Excel para comenzar.</td></tr>
              ) : (
                <>
                  {pivot.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>
                        {r.nombre}
                      </td>
                      <td><ValCell valor={r.bronce} nombre={r.nombre} esSupervisor={r.esSupervisor} columna="bronce" /></td>
                      <td><ValCell valor={r.oro}    nombre={r.nombre} esSupervisor={r.esSupervisor} columna="oro"    /></td>
                      <td><ValCell valor={r.plata}  nombre={r.nombre} esSupervisor={r.esSupervisor} columna="plata"  /></td>
                      <td><ValCell valor={r.total}  nombre={r.nombre} esSupervisor={r.esSupervisor} columna="total"  /></td>
                    </tr>
                  ))}
                  <tr className="row-total">
                    <td>TOTAL</td>
                    <td>{fmt(totales.bronce)}</td>
                    <td>{fmt(totales.oro)}</td>
                    <td>{fmt(totales.plata)}</td>
                    <td>{fmt(totales.total)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════
          Modal: Detalle por asesor / empresa
      ══════════════════════════════════════ */}
      {detalle && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDetalle(null); }}>
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <h3>
                  {detalle.esSupervisor ? '👤 Supervisor: ' : '🏢 Empresa: '}{detalle.nombre}
                  {detalle.columna && detalle.columna !== 'total' && (
                    <span className={`badge-cat ${badgeCat(detalle.columna)}`} style={{ marginLeft: 10, verticalAlign: 'middle' }}>
                      {detalle.columna.charAt(0).toUpperCase() + detalle.columna.slice(1)}
                    </span>
                  )}
                </h3>
                <p>{detalle.filas.length} registros encontrados</p>
              </div>
              <button className="btn-icon" onClick={() => setDetalle(null)}>✕</button>
            </div>
            <div className="modal-body">
              {detalle.filas.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No se encontraron registros de detalle.</div>
              ) : (
                <table className="det-table">
                  <thead>
                    <tr>
                      <th>PERÍODO</th>
                      <th>ID OPP</th>
                      <th>ASESOR</th>
                      <th>SUPERVISOR</th>
                      <th>CATEGORÍA</th>
                      <th>PONDERACIÓN</th>
                      <th>NAV PONDERADO</th>
                      <th>OPORTUNIDAD</th>
                      <th>RUT CLIENTE</th>
                      <th>NOMBRE CLIENTE</th>
                      <th>FECHA CREACIÓN</th>
                      <th>FECHA CIERRE</th>
                      <th>PROD. NVL 1</th>
                      <th>PROD. NVL 2</th>
                      <th>PROD. NVL 3</th>
                      <th>PRODUCTO</th>
                      <th>DURACIÓN</th>
                      <th>NAV</th>
                      <th>RUT CREADOR</th>
                      <th>FAMILIA</th>
                      <th>CANAL</th>
                      <th>SEGMENTO</th>
                      <th>AGRUPACIÓN</th>
                      <th>FAV (UF)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.filas.map((f, i) => (
                      <tr key={i}>
                        <td>{f.periodo}</td>
                        <td style={{ color: '#2563EB', fontWeight: 600 }}>{f.identificador_opp}</td>
                        <td style={{ fontWeight: 500 }}>{f.asesor}</td>
                        <td>{f.supervisor}</td>
                        <td><span className={chipCat(f.categoria)}>{f.categoria}</span></td>
                        <td style={{ textAlign: 'right' }}>{f.ponderacion}</td>
                        <td style={{ textAlign: 'right' }}><span className="nav-val">{fmt(f.nav_ponderado)}</span></td>
                        <td>{f.oportunidad}</td>
                        <td style={{ fontFamily: 'monospace' }}>{f.rut_cliente}</td>
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.nombre_cliente}</td>
                        <td>{fmtDate(f.fecha_creacion)}</td>
                        <td>{fmtDate(f.fecha_cierre)}</td>
                        <td>{f.producto_nivel_1}</td>
                        <td>{f.producto_nivel_2}</td>
                        <td>{f.producto_nivel_3}</td>
                        <td style={{ fontWeight: 600 }}>{f.producto}</td>
                        <td style={{ textAlign: 'right' }}>{f.duracion_contrato}</td>
                        <td style={{ textAlign: 'right' }}><span className="nav-val">{fmt(f.nav)}</span></td>
                        <td style={{ fontFamily: 'monospace' }}>{f.rut_creador}</td>
                        <td>{f.familia_empresa}</td>
                        <td>{f.canal}</td>
                        <td>{f.segmento}</td>
                        <td>{f.agrupacion}</td>
                        <td style={{ textAlign: 'right' }}><span className="nav-val">{fmt(f.fav_uf)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          Modal: Carga de archivo
      ══════════════════════════════════════ */}
      {modalCarga && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setModalCarga(false); setArchivo(null); } }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '14px', width: '420px', maxWidth: '95vw', boxShadow: '0 20px 40px rgba(0,0,0,.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#0F172A' }}>Cargar Cierre SSPP</h3>
              <button className="btn-icon" onClick={() => { setModalCarga(false); setArchivo(null); }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: '#64748B', marginTop: 0 }}>
              El Excel debe contener las hojas <strong>Cierre</strong> y <strong>Maestro</strong>.
            </p>
            <input
              type="file" accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ width: '100%', padding: '12px', border: '2px dashed #CBD5E1', borderRadius: '8px', marginBottom: '20px', cursor: 'pointer', boxSizing: 'border-box', fontSize: 13 }}
            />
            {archivo && <div style={{ marginBottom: 14, fontSize: 13, color: '#16A34A', fontWeight: 600 }}>✓ {archivo.name}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => { setModalCarga(false); setArchivo(null); }}>Cancelar</button>
              <button className="btn-amber" style={{ flex: 1 }} onClick={procesarArchivo} disabled={!archivo}>Procesar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VentasSSPP;