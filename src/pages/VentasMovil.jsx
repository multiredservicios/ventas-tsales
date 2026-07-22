import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';

/* ─── Estilos globales inyectados una sola vez ─── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :root {
    --teal:        #00897B;
    --teal-dark:   #00695C;
    --teal-light:  #E0F2F1;
    --amber:       #F59E0B;
    --amber-dark:  #D97706;
    --green:       #16A34A;
    --green-light: #DCFCE7;
    --red:         #DC2626;
    --red-light:   #FEE2E2;
    --purple:      #7C3AED;
    --purple-light:#EDE9FE;
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

  .vm-wrapper * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

  /* Header */
  .vm-header { margin-bottom: 28px; }
  .vm-header h1 { font-size: 26px; font-weight: 700; color: var(--gray-900); margin: 0 0 4px; }
  .vm-header p  { font-size: 14px; color: var(--gray-600); margin: 0; }

  /* Card */
  .vm-card {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
    padding: 20px;
    margin-bottom: 16px;
  }

  /* Filters row */
  .vm-filters { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 16px; }
  .vm-field { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 180px; }
  .vm-field label { font-size: 12px; font-weight: 600; color: var(--gray-600); }
  .vm-input {
    padding: 9px 14px;
    border: 1.5px solid var(--gray-200);
    border-radius: 8px;
    font-size: 14px;
    color: var(--gray-900);
    outline: none;
    transition: border-color .15s;
  }
  .vm-input:focus { border-color: var(--teal); }
  .vm-input::placeholder { color: var(--gray-400); }

  .vm-input-icon { position: relative; }
  .vm-input-icon input { padding-right: 40px; width: 100%; }
  .vm-input-icon .icon {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    color: var(--gray-400); pointer-events: none; font-size: 16px;
  }

  /* Buttons */
  .vm-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;
    cursor: pointer; border: none; transition: filter .15s, transform .1s;
    white-space: nowrap;
  }
  .vm-btn:active { transform: scale(.97); }
  .vm-btn-teal   { background: var(--teal);  color: #fff; }
  .vm-btn-teal:hover { filter: brightness(1.08); }
  .vm-btn-outline { background: #fff; color: var(--gray-700); border: 1.5px solid var(--gray-200); }
  .vm-btn-outline:hover { background: var(--gray-50); }
  .vm-btn-amber  { background: var(--amber); color: #fff; }
  .vm-btn-amber:hover { filter: brightness(1.06); }
  .vm-btn-blue   { background: #2563EB; color: #fff; }
  .vm-btn-blue:hover { filter: brightness(1.08); }

  .vm-actions-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .vm-left-actions { display: flex; gap: 8px; }

  /* Stats */
  .vm-stats { display: flex; gap: 20px; flex-wrap: wrap; }
  .vm-stat {
    display: flex; align-items: center; gap: 14px;
    flex: 1; min-width: 180px;
    padding: 18px 20px;
    background: #fff;
    border-radius: var(--radius);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
  }
  .vm-stat-icon {
    width: 46px; height: 46px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .vm-stat-icon.teal   { background: var(--teal);  color: #fff; }
  .vm-stat-icon.green  { background: var(--green);  color: #fff; }
  .vm-stat-icon.red    { background: var(--red);    color: #fff; }
  .vm-stat-icon.purple { background: var(--purple); color: #fff; }
  .vm-stat-label { font-size: 12px; color: var(--gray-600); margin-bottom: 2px; }
  .vm-stat-value { font-size: 22px; font-weight: 700; color: var(--gray-900); line-height: 1; }
  .vm-stat-sub   { font-size: 11px; color: var(--gray-400); margin-top: 2px; }

  /* Preview banner */
  .vm-preview-banner {
    background: #FFFBEB; color: #92400E;
    border-bottom: 1px solid #FDE68A;
    padding: 10px 20px; font-size: 13px; font-weight: 600;
    border-radius: var(--radius) var(--radius) 0 0;
  }

  /* Table */
  .vm-table-wrap { overflow-x: auto; }
  .vm-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .vm-table thead tr { background: var(--gray-50); border-bottom: 2px solid var(--gray-200); }
  .vm-table thead th {
    padding: 13px 16px; text-align: left;
    font-size: 11px; font-weight: 700; letter-spacing: .06em;
    color: var(--gray-600); text-transform: uppercase; white-space: nowrap;
  }
  .vm-table tbody tr { border-bottom: 1px solid var(--gray-100); transition: background .1s; }
  .vm-table tbody tr:hover { background: var(--gray-50); }
  .vm-table tbody td { padding: 13px 16px; color: var(--gray-700); white-space: nowrap; }

  /* Type badge */
  .vm-type-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 6px;
    border: 1.5px solid var(--gray-200);
    font-size: 12px; color: var(--gray-600); cursor: default;
  }

  /* Status badge */
  .vm-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 11.5px; font-weight: 700; letter-spacing: .02em;
  }
  .vm-status.active  { background: var(--green-light); color: var(--green); }
  .vm-status.inactive { background: var(--red-light); color: var(--red); }
  .vm-status .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  /* Segment badge (PYME / VPRIME / MASIVO) */
  .vm-seg { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .vm-seg.PYME   { background: #E8F5E9; color: #2E7D32; }
  .vm-seg.VPRIME { background: #EDE7F6; color: #4527A0; }
  .vm-seg.MASIVO { background: #FFF3E0; color: #E65100; }
  .vm-seg.default{ background: var(--gray-100); color: var(--gray-600); }

  /* Action icons */
  .vm-icon-btn {
    background: none; border: none; cursor: pointer;
    color: var(--gray-400); font-size: 16px; padding: 4px 6px;
    border-radius: 6px; transition: background .12s, color .12s;
  }
  .vm-icon-btn:hover { background: var(--gray-100); color: var(--gray-700); }

  /* Pagination */
  .vm-pagination-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-top: 1px solid var(--gray-100);
    font-size: 13px; color: var(--gray-600); flex-wrap: wrap; gap: 10px;
  }
  .vm-rows-select { display: flex; align-items: center; gap: 8px; }
  .vm-select {
    padding: 5px 28px 5px 10px; border-radius: 7px;
    border: 1.5px solid var(--gray-200); font-size: 13px;
    background: #fff; color: var(--gray-700); cursor: pointer; outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394A3B8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center;
  }
  .vm-pg-buttons { display: flex; align-items: center; gap: 4px; }
  .vm-pg-btn {
    min-width: 32px; height: 32px; border-radius: 7px;
    border: 1.5px solid var(--gray-200);
    background: #fff; color: var(--gray-700);
    font-size: 13px; font-weight: 500;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background .1s, border-color .1s;
  }
  .vm-pg-btn:hover:not(:disabled) { background: var(--gray-50); }
  .vm-pg-btn:disabled { opacity: .4; cursor: not-allowed; }
  .vm-pg-btn.active { background: var(--teal); color: #fff; border-color: var(--teal); }

  /* Modal */
  .vm-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,42,.45); backdrop-filter: blur(3px);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
  }
  .vm-modal {
    background: #fff; border-radius: 14px;
    width: 440px; max-width: 95vw;
    box-shadow: 0 20px 40px rgba(0,0,0,.18);
    overflow: hidden;
  }
  .vm-modal-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--gray-100);
    display: flex; align-items: center; justify-content: space-between;
  }
  .vm-modal-header h3 { margin: 0; font-size: 17px; font-weight: 700; color: var(--gray-900); }
  .vm-modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
  .vm-modal-footer { padding: 0 24px 20px; display: flex; gap: 10px; }

  .vm-file-input {
    padding: 14px;
    border: 2px dashed var(--gray-200);
    border-radius: 8px;
    font-size: 13px;
    color: var(--gray-600);
    cursor: pointer;
    width: 100%;
  }
  .vm-file-input:hover { border-color: var(--teal); }
  .vm-detected-badge {
    background: var(--green-light); color: var(--green);
    padding: 10px 14px; border-radius: 8px;
    font-size: 13px; font-weight: 700;
  }

  /* Responsive */
  @media (max-width: 700px) {
    .vm-stats { flex-direction: column; }
    .vm-filters { flex-direction: column; }
  }
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('vm-styles')) return;
    const el = document.createElement('style');
    el.id = 'vm-styles';
    el.textContent = GLOBAL_STYLE;
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ─── Helpers ─── */
const ROWS_OPTIONS = [10, 25, 50, 100];

function paginate(arr, page, rows) {
  return arr.slice((page - 1) * rows, page * rows);
}

function totalPages(arr, rows) {
  return Math.max(1, Math.ceil(arr.length / rows));
}

function PaginationButtons({ current, total, onChange }) {
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('…');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('…');
    pages.push(total);
  }
  return (
    <div className="vm-pg-buttons">
      <button className="vm-icon-btn" onClick={() => onChange(current - 1)} disabled={current === 1}>‹</button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--gray-400)' }}>…</span>
          : <button key={p} className={`vm-pg-btn${p === current ? ' active' : ''}`} onClick={() => onChange(p)}>{p}</button>
      )}
      <button className="vm-icon-btn" onClick={() => onChange(current + 1)} disabled={current === total}>›</button>
    </div>
  );
}

/* ─── Main Component ─── */
function VentasMovil() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [tipoDetectado, setTipoDetectado] = useState(null);

  const [ventasDb, setVentasDb] = useState([]);
  const [datosVentas, setDatosVentas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [searchId, setSearchId] = useState('');
  const [searchEj, setSearchEj] = useState('');

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { obtenerVentas(); }, []);

  const obtenerVentas = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('ventas')
      .select('*, ejecutivos(nombre)')
      .eq('tipo_servicio', 'MOVIL')
      .order('id', { ascending: false });

    if (error) console.error('Error al obtener ventas:', error);
    else setVentasDb(data);
    setCargando(false);
  };

  const handleSeleccionArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fn = file.name.toUpperCase();
    let type = null;
    if (fn.includes('PYME')) type = 'PYME';
    else if (fn.includes('VPRIME')) type = 'VPRIME';
    else if (fn.includes('MASIVO')) type = 'MASIVO';
    setTipoDetectado(type);
    setArchivo(file);
  };

  const procesarArchivo = () => {
    if (!archivo || !tipoDetectado)
      return alert('Tipo de archivo no identificado. El nombre debe contener PYME, VPRIME o MASIVO.');

    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      let mapped = [];

      if (tipoDetectado === 'MASIVO') {
        const wsMaestro = wb.Sheets['Maestro'];
        const wsBase = wb.Sheets['Base'];
        if (!wsMaestro) return alert('No se encontró la hoja: Maestro');
        const maestroRaw = XLSX.utils.sheet_to_json(wsMaestro, { defval: '' });
        const baseMap = {};
        if (wsBase) {
          const baseRaw = XLSX.utils.sheet_to_json(wsBase, { defval: '' });
          baseRaw.forEach((r) => {
            const orden = r['ORDEN'] || '';
            if (orden) baseMap[String(orden)] = { plan: r['PLAN '] || r['PLAN'] || '', ejecutivo: (r['EJECUTIVO '] || r['EJECUTIVO'] || '').trim() };
          });
        }
        mapped = maestroRaw.map((r) => {
          const orden = r['ORDEN'] || '';
          const baseInfo = baseMap[String(orden)] || {};
          const celular = r['CELULAR'] || r['cel'] || '';
          return { _tipo: 'MASIVO', orden: String(orden), rut: String(r['RUT_CLIENTE'] || ''), plan: baseInfo.plan || r['TALLA'] || '', celular: String(celular).replace(/^56/, ''), ejecutivo: baseInfo.ejecutivo || r['EJECUTIVO'] || '', supervisor: r['SUPERVISOR'] || '', periodo: String(r['PERIODO'] || '') };
        }).filter((r) => r.orden !== '');

      } else if (tipoDetectado === 'PYME') {
        const ws = wb.Sheets['Base_Movil'];
        if (!ws) return alert('No se encontró la hoja: Base_Movil');
        const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
        mapped = raw.map((r) => {
          const celular = r['Celular'] || r['N° CELULAR / PETICIÓN'] || '';
          return { _tipo: 'PYME', orden: String(r['N° CELULAR / PETICIÓN'] || ''), rut: String(r['RUT CLIENTE'] || ''), plan: r['Codigo Plan'] || '', celular: String(celular).replace(/^56/, ''), ejecutivo: (r['ASESOR'] || '').trim(), supervisor: r['SUPERVISOR'] || '', periodo: '', entrada: r['Entrada'] || '', detalle: r['DETALLE'] || '' };
        }).filter((r) => r.orden !== '');

      } else if (tipoDetectado === 'VPRIME') {
        const ws = wb.Sheets['Movil_Claro'];
        if (!ws) return alert('No se encontró la hoja: Movil_Claro');
        const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
        mapped = raw.map((r) => {
          const celular = r['NRO_DE_PCS'] || '';
          return { _tipo: 'VPRIME', orden: String(celular).replace(/^56/, ''), rut: String(r['RUT_TITULAR_CUENTA'] || ''), plan: r['PLANES_TARIFARIOS'] || '', celular: String(celular).replace(/^56/, ''), ejecutivo: (r['EJECUTIVO_ESTANDAR'] || r['EJECUTIVO'] || '').trim(), supervisor: r['SUPERVISOR_ESTANDAR'] || r['SUPERVISOR'] || '', periodo: String(r['VC_PERIODO_COMISIONABLE'] || r['VC_PERIODO_VENTA'] || '') };
        }).filter((r) => r.orden !== '');
      }

      setDatosVentas(mapped);
      setModalAbierto(false);
    };
    reader.readAsArrayBuffer(archivo);
  };

  const guardarEnBaseDeDatos = async () => {
    if (datosVentas.length === 0) return;
    let { data: todosEj } = await supabase.from('ejecutivos').select('id, nombre');

    // Crear ejecutivos que no existen en BD
    const nombresUnicos = [...new Set(datosVentas.map((v) => (v.ejecutivo || '').trim().toUpperCase()).filter(Boolean))];
    for (const nombreEj of nombresUnicos) {
      const existe = todosEj.find((e) => e.nombre.trim().toUpperCase() === nombreEj);
      if (!existe) {
        const { data: nuevoEj, error: errEj } = await supabase.from('ejecutivos').insert({ nombre: nombreEj }).select().single();
        if (!errEj && nuevoEj) todosEj = [...todosEj, nuevoEj];
      }
    }

    const ventasGuardar = datosVentas.map((v) => {
      const nombreEj = (v.ejecutivo || '').trim().toUpperCase();
      const ej = todosEj.find((e) => e.nombre.trim().toUpperCase() === nombreEj);
      return { ejecutivo_id: ej ? ej.id : null, tipo_servicio: 'MOVIL', fecha_ingreso: new Date().toISOString().split('T')[0], rut_cliente: v.rut || 'Sin RUT', numero_orden: v.orden, producto: v.plan || 'Sin Plan', celular: v.celular || '', estado: 'ACTIVA', segmento: v._tipo };
    });
    const { error } = await supabase.from('ventas').insert(ventasGuardar);
    if (error) { alert('Error al guardar: ' + error.message); console.error(error); }
    else { alert(`¡Éxito! ${ventasGuardar.length} ventas móvil guardadas.`); setDatosVentas([]); obtenerVentas(); }
  };

  /* ─── Filtrado ─── */
  const listaMostrada = datosVentas.length > 0 ? datosVentas : ventasDb;

  const filtrada = listaMostrada.filter((v) => {
    const orden = (v.orden || v.numero_orden || '').toLowerCase();
    const ej = (v.ejecutivo || (v.ejecutivos ? v.ejecutivos.nombre : '') || '').toLowerCase();
    const idOk = !searchId || orden.includes(searchId.toLowerCase());
    const ejOk = !searchEj || ej.includes(searchEj.toLowerCase());
    return idOk && ejOk;
  });

  const totalRegistros = ventasDb.length;
  const activas = ventasDb.filter((v) => v.estado === 'ACTIVA').length;
  const inactivas = totalRegistros - activas;
  const ultimaCarga = ventasDb[0]?.fecha_ingreso || null;

  const tp = totalPages(filtrada, rowsPerPage);
  const paginada = paginate(filtrada, page, rowsPerPage);

  const handleFilter = () => setPage(1);
  const handleClear = () => { setSearchId(''); setSearchEj(''); setPage(1); };

  return (
    <div className="vm-wrapper" style={{ padding: '28px 32px', background: 'var(--gray-50)', minHeight: '100vh' }}>
      <StyleInjector />

      {/* ── Header ── */}
      <div className="vm-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>
            Listado Ventas Móvil
            {tipoDetectado && <span style={{ color: 'var(--teal)', fontSize: 16, fontWeight: 500, marginLeft: 10 }}>({tipoDetectado})</span>}
          </h1>
          <p>Consulta y gestiona las ventas registradas desde archivos móviles.</p>
        </div>
      </div>

      {/* ── Filters Card ── */}
      <div className="vm-card">
        <div className="vm-filters">
          <div className="vm-field">
            <label>Buscar por ID genérico</label>
            <div className="vm-input-icon">
              <input className="vm-input" placeholder="Ej: 108563036" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
              <span className="icon">🔍</span>
            </div>
          </div>
          <div className="vm-field">
            <label>Buscar por ejecutivo</label>
            <div className="vm-input-icon">
              <input className="vm-input" placeholder="Ej: Danilo_Alvarez" value={searchEj} onChange={(e) => setSearchEj(e.target.value)} />
              <span className="icon">🔍</span>
            </div>
          </div>
        </div>

        <div className="vm-actions-row">
          <div className="vm-left-actions">
            <button className="vm-btn vm-btn-teal" onClick={handleFilter}>
              <span>⧖</span> Filtrar
            </button>
            <button className="vm-btn vm-btn-outline" onClick={handleClear}>
              <span>↺</span> Limpiar filtros
            </button>
            {datosVentas.length > 0 && (
              <button className="vm-btn vm-btn-blue" onClick={guardarEnBaseDeDatos}>
                💾 Guardar en BD ({datosVentas.length})
              </button>
            )}
          </div>
          <button className="vm-btn vm-btn-amber" onClick={() => setModalAbierto(true)}>
            <span>⬆</span> Cargar Ventas Móvil
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="vm-stats" style={{ marginBottom: 16 }}>
        <div className="vm-stat">
          <div className="vm-stat-icon teal">📋</div>
          <div>
            <div className="vm-stat-label">Total registros</div>
            <div className="vm-stat-value">{totalRegistros}</div>
            <div className="vm-stat-sub">ventas móviles</div>
          </div>
        </div>
        <div className="vm-stat">
          <div className="vm-stat-icon green">✓</div>
          <div>
            <div className="vm-stat-label">Activas</div>
            <div className="vm-stat-value">{activas}</div>
            <div className="vm-stat-sub">{totalRegistros ? Math.round(activas / totalRegistros * 100) : 0}% del total</div>
          </div>
        </div>
        <div className="vm-stat">
          <div className="vm-stat-icon red">🚫</div>
          <div>
            <div className="vm-stat-label">Inactivas</div>
            <div className="vm-stat-value">{inactivas}</div>
            <div className="vm-stat-sub">{totalRegistros ? Math.round(inactivas / totalRegistros * 100) : 0}% del total</div>
          </div>
        </div>
        <div className="vm-stat">
          <div className="vm-stat-icon purple">📅</div>
          <div>
            <div className="vm-stat-label">Última carga</div>
            <div className="vm-stat-value" style={{ fontSize: 16 }}>
              {ultimaCarga ? new Date(ultimaCarga).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {datosVentas.length > 0 && (
          <div className="vm-preview-banner">
            ⚠️ Previsualización: {datosVentas.length} registros detectados como <strong>{tipoDetectado}</strong>. Revisa y confirma antes de guardar.
          </div>
        )}

        <div className="vm-table-wrap">
          <table className="vm-table">
            <thead>
              <tr>
                <th>TIPO</th>
                <th>N° ORDEN / CELULAR</th>
                <th>PERIODO 📅</th>
                <th>RUT CLIENTE</th>
                {tipoDetectado === 'PYME' ? (
                  <>
                    <th>ENTRADA</th>
                    <th>DETALLE</th>
                  </>
                ) : (
                  <th>PLAN</th>
                )}
                <th>CELULAR</th>
                <th>EJECUTIVO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {cargando && datosVentas.length === 0 ? (
                <tr><td colSpan="10" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Cargando datos…</td></tr>
              ) : paginada.length === 0 ? (
                <tr><td colSpan="10" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>No hay registros.</td></tr>
              ) : (
                paginada.map((venta, index) => {
                  const tipo     = venta._tipo || venta.segmento || '-';
                  const orden    = venta.orden || venta.numero_orden || '-';
                  const periodo  = venta.periodo || venta.fecha_ingreso || '-';
                  const rut      = venta.rut || venta.rut_cliente || '-';
                  const plan     = venta.plan || venta.producto || '-';
                  const entrada  = venta.entrada || '-';
                  const detalle  = venta.detalle || '-';
                  const celular  = venta.celular || '-';
                  const ejecutivo = venta.ejecutivo || (venta.ejecutivos ? venta.ejecutivos.nombre : 'Sin Asignar');
                  const estado   = venta.estado || 'ACTIVA';
                  const segClass = ['PYME','VPRIME','MASIVO'].includes(tipo) ? tipo : 'default';
                  const esPyme   = tipo === 'PYME' || tipoDetectado === 'PYME';

                  return (
                    <tr key={venta.id || index}>
                      <td>
                        {tipo !== '-'
                          ? <span className={`vm-seg ${segClass}`}>{tipo}</span>
                          : <span className="vm-type-badge">+</span>
                        }
                      </td>
                      <td style={{ fontWeight: 500 }}>{orden}</td>
                      <td>{periodo}</td>
                      <td>{rut}</td>
                      {esPyme ? (
                        <>
                          <td>{entrada}</td>
                          <td>{detalle}</td>
                        </>
                      ) : (
                        <td><span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{plan}</span></td>
                      )}
                      <td style={{ color: 'var(--gray-400)' }}>{celular === '' || celular === '-' ? '—' : celular}</td>
                      <td style={{ fontWeight: 500 }}>{ejecutivo.toUpperCase()}</td>
                      <td>
                        <span className={`vm-status ${estado === 'ACTIVA' ? 'active' : 'inactive'}`}>
                          <span className="dot" /> {estado}
                        </span>
                      </td>
                      <td>
                        <button className="vm-icon-btn" title="Ver detalle">👁</button>
                        <button className="vm-icon-btn" title="Más opciones">⋮</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="vm-pagination-row">
          <span>Mostrando {filtrada.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} a {Math.min(page * rowsPerPage, filtrada.length)} de {filtrada.length} registros</span>
          <div className="vm-rows-select">
            <span>Filas por página:</span>
            <select className="vm-select" value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}>
              {ROWS_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <PaginationButtons current={page} total={tp} onChange={setPage} />
        </div>
      </div>

      {/* ── Modal ── */}
      {modalAbierto && (
        <div className="vm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setModalAbierto(false); setTipoDetectado(null); setArchivo(null); } }}>
          <div className="vm-modal">
            <div className="vm-modal-header">
              <h3>Cargar Ventas Móvil</h3>
              <button className="vm-icon-btn" onClick={() => { setModalAbierto(false); setTipoDetectado(null); setArchivo(null); }}>✕</button>
            </div>
            <div className="vm-modal-body">
              <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-600)' }}>
                El nombre del archivo debe contener <strong>PYME</strong>, <strong>VPRIME</strong> o <strong>MASIVO</strong>.
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleSeleccionArchivo}
                className="vm-file-input"
              />
              {tipoDetectado && (
                <div className="vm-detected-badge">✓ Tipo detectado: {tipoDetectado}</div>
              )}
            </div>
            <div className="vm-modal-footer">
              <button
                className="vm-btn vm-btn-outline"
                style={{ flex: 1 }}
                onClick={() => { setModalAbierto(false); setTipoDetectado(null); setArchivo(null); }}
              >
                Cancelar
              </button>
              <button
                className={`vm-btn ${tipoDetectado ? 'vm-btn-teal' : ''}`}
                style={{ flex: 2, background: tipoDetectado ? undefined : 'var(--gray-200)', color: tipoDetectado ? undefined : 'var(--gray-400)', cursor: tipoDetectado ? 'pointer' : 'not-allowed' }}
                onClick={procesarArchivo}
                disabled={!tipoDetectado}
              >
                Procesar Archivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VentasMovil;