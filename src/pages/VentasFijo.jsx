import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';

/* ─── Estilos globales (mismos que VentasMovil) ─── */
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

  .vf-wrapper * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

  .vf-header { margin-bottom: 28px; }
  .vf-header h1 { font-size: 26px; font-weight: 700; color: var(--gray-900); margin: 0 0 4px; }
  .vf-header p  { font-size: 14px; color: var(--gray-600); margin: 0; }

  .vf-card {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
    padding: 20px;
    margin-bottom: 16px;
  }

  .vf-filters { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 16px; }
  .vf-field { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 180px; }
  .vf-field label { font-size: 12px; font-weight: 600; color: var(--gray-600); }
  .vf-input {
    padding: 9px 14px;
    border: 1.5px solid var(--gray-200);
    border-radius: 8px;
    font-size: 14px;
    color: var(--gray-900);
    outline: none;
    transition: border-color .15s;
    width: 100%;
  }
  .vf-input:focus { border-color: var(--teal); }
  .vf-input::placeholder { color: var(--gray-400); }

  .vf-input-icon { position: relative; }
  .vf-input-icon input { padding-right: 40px; }
  .vf-input-icon .icon {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    color: var(--gray-400); pointer-events: none; font-size: 16px;
  }

  .vf-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;
    cursor: pointer; border: none; transition: filter .15s, transform .1s;
    white-space: nowrap;
  }
  .vf-btn:active { transform: scale(.97); }
  .vf-btn-teal    { background: var(--teal);  color: #fff; }
  .vf-btn-teal:hover { filter: brightness(1.08); }
  .vf-btn-outline { background: #fff; color: var(--gray-700); border: 1.5px solid var(--gray-200); }
  .vf-btn-outline:hover { background: var(--gray-50); }
  .vf-btn-amber   { background: var(--amber); color: #fff; }
  .vf-btn-amber:hover { filter: brightness(1.06); }
  .vf-btn-blue    { background: #2563EB; color: #fff; }
  .vf-btn-blue:hover { filter: brightness(1.08); }

  .vf-actions-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .vf-left-actions { display: flex; gap: 8px; }

  /* Stats */
  .vf-stats { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 16px; }
  .vf-stat {
    display: flex; align-items: center; gap: 14px;
    flex: 1; min-width: 180px;
    padding: 18px 20px;
    background: #fff;
    border-radius: var(--radius);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
  }
  .vf-stat-icon {
    width: 46px; height: 46px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .vf-stat-icon.teal   { background: var(--teal);  color: #fff; }
  .vf-stat-icon.green  { background: var(--green);  color: #fff; }
  .vf-stat-icon.red    { background: var(--red);    color: #fff; }
  .vf-stat-icon.purple { background: var(--purple); color: #fff; }
  .vf-stat-label { font-size: 12px; color: var(--gray-600); margin-bottom: 2px; }
  .vf-stat-value { font-size: 22px; font-weight: 700; color: var(--gray-900); line-height: 1; }
  .vf-stat-sub   { font-size: 11px; color: var(--gray-400); margin-top: 2px; }

  /* Preview banner */
  .vf-preview-banner {
    background: #FFFBEB; color: #92400E;
    border-bottom: 1px solid #FDE68A;
    padding: 10px 20px; font-size: 13px; font-weight: 600;
    border-radius: var(--radius) var(--radius) 0 0;
  }

  /* Table */
  .vf-table-wrap { overflow-x: auto; }
  .vf-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .vf-table thead tr { background: var(--gray-50); border-bottom: 2px solid var(--gray-200); }
  .vf-table thead th {
    padding: 13px 16px; text-align: left;
    font-size: 11px; font-weight: 700; letter-spacing: .06em;
    color: var(--gray-600); text-transform: uppercase; white-space: nowrap;
  }
  .vf-table tbody tr { border-bottom: 1px solid var(--gray-100); transition: background .1s; }
  .vf-table tbody tr:hover { background: var(--gray-50); }
  .vf-table tbody td { padding: 13px 16px; color: var(--gray-700); white-space: nowrap; }

  /* Segment badge */
  .vf-seg { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .vf-seg.PYME   { background: #E8F5E9; color: #2E7D32; }
  .vf-seg.SSPP   { background: #E3F2FD; color: #1565C0; }
  .vf-seg.MASIVO { background: #FFF3E0; color: #E65100; }
  .vf-seg.default{ background: var(--gray-100); color: var(--gray-600); }

  /* Status badge */
  .vf-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 11.5px; font-weight: 700;
  }
  .vf-status.active   { background: var(--green-light); color: var(--green); }
  .vf-status.inactive { background: var(--red-light);   color: var(--red); }
  .vf-status .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  /* Action icons */
  .vf-icon-btn {
    background: none; border: none; cursor: pointer;
    color: var(--gray-400); font-size: 16px; padding: 4px 6px;
    border-radius: 6px; transition: background .12s, color .12s;
  }
  .vf-icon-btn:hover { background: var(--gray-100); color: var(--gray-700); }

  /* Pagination */
  .vf-pagination-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-top: 1px solid var(--gray-100);
    font-size: 13px; color: var(--gray-600); flex-wrap: wrap; gap: 10px;
  }
  .vf-rows-select { display: flex; align-items: center; gap: 8px; }
  .vf-select {
    padding: 5px 28px 5px 10px; border-radius: 7px;
    border: 1.5px solid var(--gray-200); font-size: 13px;
    background: #fff; color: var(--gray-700); cursor: pointer; outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394A3B8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center;
  }
  .vf-pg-buttons { display: flex; align-items: center; gap: 4px; }
  .vf-pg-btn {
    min-width: 32px; height: 32px; border-radius: 7px;
    border: 1.5px solid var(--gray-200);
    background: #fff; color: var(--gray-700);
    font-size: 13px; font-weight: 500;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background .1s, border-color .1s;
  }
  .vf-pg-btn:hover:not(:disabled) { background: var(--gray-50); }
  .vf-pg-btn:disabled { opacity: .4; cursor: not-allowed; }
  .vf-pg-btn.active { background: var(--teal); color: #fff; border-color: var(--teal); }

  /* Modal */
  .vf-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,42,.45); backdrop-filter: blur(3px);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
  }
  .vf-modal {
    background: #fff; border-radius: 14px;
    width: 440px; max-width: 95vw;
    box-shadow: 0 20px 40px rgba(0,0,0,.18);
    overflow: hidden;
  }
  .vf-modal-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--gray-100);
    display: flex; align-items: center; justify-content: space-between;
  }
  .vf-modal-header h3 { margin: 0; font-size: 17px; font-weight: 700; color: var(--gray-900); }
  .vf-modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
  .vf-modal-footer { padding: 0 24px 20px; display: flex; gap: 10px; }

  .vf-file-input {
    padding: 14px;
    border: 2px dashed var(--gray-200);
    border-radius: 8px;
    font-size: 13px;
    color: var(--gray-600);
    cursor: pointer;
    width: 100%;
  }
  .vf-file-input:hover { border-color: var(--teal); }
  .vf-detected-badge {
    background: var(--green-light); color: var(--green);
    padding: 10px 14px; border-radius: 8px;
    font-size: 13px; font-weight: 700;
  }

  @media (max-width: 700px) {
    .vf-stats { flex-direction: column; }
    .vf-filters { flex-direction: column; }
  }
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('vf-styles')) return;
    const el = document.createElement('style');
    el.id = 'vf-styles';
    el.textContent = GLOBAL_STYLE;
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ─── Helpers de paginación ─── */
const ROWS_OPTIONS = [10, 25, 50, 100];
const paginate   = (arr, page, rows) => arr.slice((page - 1) * rows, page * rows);
const totalPages = (arr, rows) => Math.max(1, Math.ceil(arr.length / rows));

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
    <div className="vf-pg-buttons">
      <button className="vf-icon-btn" onClick={() => onChange(current - 1)} disabled={current === 1}>‹</button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e-${i}`} style={{ padding: '0 4px', color: 'var(--gray-400)' }}>…</span>
          : <button key={p} className={`vf-pg-btn${p === current ? ' active' : ''}`} onClick={() => onChange(p)}>{p}</button>
      )}
      <button className="vf-icon-btn" onClick={() => onChange(current + 1)} disabled={current === total}>›</button>
    </div>
  );
}

/* ─── Componente principal ─── */
function VentasFijo() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [datosVentas, setDatosVentas] = useState([]);
  const [ventasDb, setVentasDb] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tipoDetectado, setTipoDetectado] = useState(null);

  const [searchId, setSearchId] = useState('');
  const [searchEj, setSearchEj] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { obtenerVentas(); }, []);

  const obtenerVentas = async () => {
    setCargando(true);
    const { data } = await supabase
      .from('ventas')
      .select('*, ejecutivos(nombre)')
      .eq('tipo_servicio', 'FIJO')
      .order('id', { ascending: false });
    if (data) setVentasDb(data);
    setCargando(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fn = file.name.toUpperCase();
    let type = null;
    if (fn.includes('SSPP'))         type = 'SSPP';
    else if (fn.includes('PYME'))    type = 'PYME';
    else if (fn.includes('MASIVO'))  type = 'MASIVO';
    setTipoDetectado(type);
    setArchivo(file);
  };

  const procesarArchivo = () => {
    if (!archivo || !tipoDetectado)
      return alert('Tipo de archivo no identificado. El nombre debe contener SSPP, PYME o MASIVO.');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        let mapped = [];

        /* ── PYME: hoja Maestro + hoja Base para RUT ── */
        if (tipoDetectado === 'PYME') {
          const wsMaestro = wb.Sheets['Maestro'];
          const wsBase    = wb.Sheets['Base'];
          if (!wsMaestro) return alert('No se encontró la hoja "Maestro" en el archivo PYME.');
          const maestroRaw = XLSX.utils.sheet_to_json(wsMaestro, { defval: '' });

          // Construir mapa PETICION → RUT desde la hoja Base
          const rutMap = {};
          if (wsBase) {
            XLSX.utils.sheet_to_json(wsBase, { defval: '' }).forEach(r => {
              const pet = String(r['PETICION'] || r['PETICIÓN'] || '').trim();
              if (pet) rutMap[pet] = String(r['RUT CLIENTE'] || '').trim();
            });
          }

          mapped = maestroRaw.map(r => {
            const orden = String(r['ORDEN'] || '').trim();
            // TERMINADA → ACTIVA, resto → CAIDA
            const estadoRaw = String(r['ESTADO'] || '').toUpperCase();
            const estado = estadoRaw === 'TERMINADA' ? 'ACTIVA' : 'CAIDA';
            const fechaRaw = String(r['FECHA_EMISION'] || '').replace(/\D/g, '');
            const fecha = fechaRaw.length === 8
              ? `${fechaRaw.slice(0,4)}-${fechaRaw.slice(4,6)}-${fechaRaw.slice(6,8)}`
              : new Date().toISOString().split('T')[0];
            return {
              _segmento: 'PYME',
              orden,
              rut: rutMap[orden] || '',
              producto: r['PRODUCTO'] || '',
              direccion: r['CANAL'] || '',
              ejecutivo: r['EJECUTIVO_ESTANDAR'] || r['EJECUTIVO'] || '',
              estado,
              fecha,
            };
          }).filter(r => r.orden !== '');

        /* ── MASIVO: hoja Maestro + hoja Base para RUT ── */
        } else if (tipoDetectado === 'MASIVO') {
          const wsMaestro = wb.Sheets['Maestro'];
          const wsBase    = wb.Sheets['Base'];
          if (!wsMaestro) return alert('No se encontró la hoja "Maestro" en el archivo MASIVO.');
          const maestroRaw = XLSX.utils.sheet_to_json(wsMaestro, { defval: '' });

          const rutMap = {};
          if (wsBase) {
            XLSX.utils.sheet_to_json(wsBase, { defval: '' }).forEach(r => {
              const pet = String(r['PETICIÓN'] || r['PETICION'] || '').trim();
              if (pet) rutMap[pet] = String(r['RUT CLIENTE'] || '').trim();
            });
          }

          mapped = maestroRaw.map(r => {
            const orden = String(r['ORDEN'] || '').trim();
            const estadoRaw = String(r['ESTADO'] || '').toUpperCase();
            const estado = estadoRaw === 'TERMINADA' ? 'ACTIVA' : 'CAIDA';
            const fechaRaw = String(r['FECHA_EMISION'] || '').replace(/\D/g, '');
            const fecha = fechaRaw.length === 8
              ? `${fechaRaw.slice(0,4)}-${fechaRaw.slice(4,6)}-${fechaRaw.slice(6,8)}`
              : new Date().toISOString().split('T')[0];
            // RUT: primero desde Maestro, luego desde Base como fallback
            const rutMaestro = String(r['RUT_CLIENTE'] || '').trim();
            return {
              _segmento: 'MASIVO',
              orden,
              rut: rutMaestro || rutMap[orden] || '',
              producto: r['PRODUCTO'] || r['DESC_PRODUCTO'] || '',
              direccion: r['DIRECCION_INSTALACION'] || '',
              ejecutivo: r['EJECUTIVO_ESTANDAR'] || r['EJECUTIVO'] || '',
              estado,
              fecha,
            };
          }).filter(r => r.orden !== '');

        /* ── SSPP: hoja Maestro (estructura diferente) ── */
        } else if (tipoDetectado === 'SSPP') {
          const wsMaestro = wb.Sheets['Maestro'];
          const wsBase    = wb.Sheets['Base'];
          if (!wsMaestro) return alert('No se encontró la hoja "Maestro" en el archivo SSPP.');
          const maestroRaw = XLSX.utils.sheet_to_json(wsMaestro, { defval: '' });

          // Base de SSPP tiene: FOLIO (OR), RUT, ASESOR, ESTADO
          const rutMap = {};
          const estadoMap = {};
          if (wsBase) {
            XLSX.utils.sheet_to_json(wsBase, { defval: '' }).forEach(r => {
              const folio = String(r['FOLIO (OR)'] || '').trim();
              if (folio) {
                rutMap[folio]    = String(r['RUT'] || '').trim();
                estadoMap[folio] = String(r['ESTADO'] || '').trim().toUpperCase();
              }
            });
          }

          mapped = maestroRaw.map(r => {
            const orden = String(r['IDENTIFICADOR_OPP'] || '').trim();
            // SSPP no tiene ESTADO en Maestro, usa Base
            const estadoBase = estadoMap[orden] || '';
            const estado = estadoBase === 'CONTRATO' ? 'ACTIVA' : estadoBase === 'GIT' ? 'ACTIVA' : 'CAIDA';
            const fechaRaw = r['FECHA_CREACION'] ? String(r['FECHA_CREACION']).split('T')[0] : '';
            const fecha = fechaRaw || new Date().toISOString().split('T')[0];
            const rutCliente = String(r['RUT_CLIENTE'] || rutMap[orden] || '').trim();
            return {
              _segmento: 'SSPP',
              orden,
              rut: rutCliente,
              producto: r['PRODUCTO'] || `${r['PRODUCTO_NIVEL_1'] || ''} ${r['PRODUCTO_NIVEL_2'] || ''}`.trim(),
              direccion: r['canal'] || r['segmento propuesto'] || '',
              ejecutivo: r['EJECUTIVO'] || '',
              estado,
              fecha,
            };
          }).filter(r => r.orden !== '');
        }

        if (mapped.length === 0) {
          return alert('No se encontraron registros válidos en el archivo. Verifica que sea el archivo correcto.');
        }

        setDatosVentas(mapped);
        setModalAbierto(false);
      } catch (err) {
        alert('Error al procesar el archivo: ' + err.message);
        console.error(err);
      }
    };
    reader.onerror = () => alert('Error al leer el archivo.');
    reader.readAsArrayBuffer(archivo);
  };

  const guardarEnBD = async () => {
    try {
      // 1. Obtener ejecutivos existentes
      const { data: todosEj, error: ejError } = await supabase.from('ejecutivos').select('id, nombre');
      if (ejError) throw new Error('Error al obtener ejecutivos: ' + ejError.message);

      // 2. Detectar ejecutivos que NO existen y crearlos
      const nombresEnExcel = [...new Set(
        datosVentas
          .map(v => (v.ejecutivo || '').trim().toUpperCase())
          .filter(n => n && n !== '')
      )];
      const nombresExistentes = new Set(todosEj.map(e => e.nombre.trim().toUpperCase()));
      const nuevosNombres = nombresEnExcel.filter(n => !nombresExistentes.has(n));

      if (nuevosNombres.length > 0) {
        const { error: insertEjError } = await supabase
          .from('ejecutivos')
          .insert(nuevosNombres.map(nombre => ({ nombre })));
        if (insertEjError) throw new Error('Error al crear ejecutivos: ' + insertEjError.message);
      }

      // 3. Recargar ejecutivos con los recién creados
      const { data: todosEjActualizados, error: ejError2 } = await supabase.from('ejecutivos').select('id, nombre');
      if (ejError2) throw new Error('Error al recargar ejecutivos: ' + ejError2.message);

      // 4. Mapear ventas con ejecutivo_id
      const mapaEj = {};
      todosEjActualizados.forEach(e => { mapaEj[e.nombre.trim().toUpperCase()] = e.id; });

      const ventasFinales = datosVentas.map(v => {
        const nombreEj = (v.ejecutivo || '').trim().toUpperCase();
        return {
          ejecutivo_id: mapaEj[nombreEj] || null,
          tipo_servicio: 'FIJO',
          fecha_ingreso: v.fecha || new Date().toISOString().split('T')[0],
          rut_cliente: v.rut,
          numero_orden: String(v.orden),
          producto: v.producto,
          direccion: v.direccion || '',
          estado: v.estado || 'ACTIVA',
          segmento: v._segmento,
        };
      });

      // 5. Insertar en lotes de 500 para evitar límite de Supabase
      const BATCH_SIZE = 500;
      let totalInsertados = 0;
      for (let i = 0; i < ventasFinales.length; i += BATCH_SIZE) {
        const lote = ventasFinales.slice(i, i + BATCH_SIZE);
        const { error: insertError } = await supabase.from('ventas').insert(lote);
        if (insertError) throw new Error(`Error en lote ${Math.floor(i / BATCH_SIZE) + 1}: ${insertError.message}`);
        totalInsertados += lote.length;
      }

      alert(`✅ Guardado con éxito: ${totalInsertados} registros${nuevosNombres.length > 0 ? `\n👤 Ejecutivos nuevos creados: ${nuevosNombres.join(', ')}` : ''}`);
      setDatosVentas([]);
      obtenerVentas();
    } catch (err) {
      alert('❌ Error al guardar: ' + err.message);
      console.error(err);
    }
  };

  /* ─── Filtrado y paginación ─── */
  const listaMostrada = datosVentas.length > 0 ? datosVentas : ventasDb;

  const filtrada = listaMostrada.filter(v => {
    const orden = (v.orden || v.numero_orden || '').toLowerCase();
    const ej    = (v.ejecutivo || (v.ejecutivos ? v.ejecutivos.nombre : '') || '').toLowerCase();
    return (!searchId || orden.includes(searchId.toLowerCase()))
        && (!searchEj || ej.includes(searchEj.toLowerCase()));
  });

  const totalRegistros = ventasDb.length;
  const activas   = ventasDb.filter(v => v.estado === 'ACTIVA').length;
  const inactivas = totalRegistros - activas;
  const ultimaCarga = ventasDb[0]?.fecha_ingreso || null;

  const tp      = totalPages(filtrada, rowsPerPage);
  const paginada = paginate(filtrada, page, rowsPerPage);

  const handleFilter = () => setPage(1);
  const handleClear  = () => { setSearchId(''); setSearchEj(''); setPage(1); };

  /* ─── Render ─── */
  return (
    <div className="vf-wrapper" style={{ padding: '28px 32px', background: 'var(--gray-50)', minHeight: '100vh' }}>
      <StyleInjector />

      {/* ── Header ── */}
      <div className="vf-header">
        <h1>
          Listado Ventas Fijo
          {tipoDetectado && (
            <span style={{ color: 'var(--teal)', fontSize: 16, fontWeight: 500, marginLeft: 10 }}>
              ({tipoDetectado})
            </span>
          )}
        </h1>
        <p>Consulta y gestiona las ventas registradas desde archivos fijo.</p>
      </div>

      {/* ── Filters Card ── */}
      <div className="vf-card">
        <div className="vf-filters">
          <div className="vf-field">
            <label>Buscar por N° Orden</label>
            <div className="vf-input-icon">
              <input className="vf-input" placeholder="Ej: 1207925853" value={searchId} onChange={e => setSearchId(e.target.value)} />
              <span className="icon">🔍</span>
            </div>
          </div>
          <div className="vf-field">
            <label>Buscar por ejecutivo</label>
            <div className="vf-input-icon">
              <input className="vf-input" placeholder="Ej: Danilo_Alvarez" value={searchEj} onChange={e => setSearchEj(e.target.value)} />
              <span className="icon">🔍</span>
            </div>
          </div>
        </div>

        <div className="vf-actions-row">
          <div className="vf-left-actions">
            <button className="vf-btn vf-btn-teal" onClick={handleFilter}>
              <span>⧖</span> Filtrar
            </button>
            <button className="vf-btn vf-btn-outline" onClick={handleClear}>
              <span>↺</span> Limpiar filtros
            </button>
            {datosVentas.length > 0 && (
              <button className="vf-btn vf-btn-blue" onClick={guardarEnBD}>
                💾 Guardar en BD ({datosVentas.length} registros)
              </button>
            )}
          </div>
          <button className="vf-btn vf-btn-amber" onClick={() => setModalAbierto(true)}>
            <span>⬆</span> Cargar Ventas Fijo
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="vf-stats">
        <div className="vf-stat">
          <div className="vf-stat-icon teal">📋</div>
          <div>
            <div className="vf-stat-label">Total registros</div>
            <div className="vf-stat-value">{totalRegistros}</div>
            <div className="vf-stat-sub">ventas fijo</div>
          </div>
        </div>
        <div className="vf-stat">
          <div className="vf-stat-icon green">✓</div>
          <div>
            <div className="vf-stat-label">Activas</div>
            <div className="vf-stat-value">{activas}</div>
            <div className="vf-stat-sub">{totalRegistros ? Math.round(activas / totalRegistros * 100) : 0}% del total</div>
          </div>
        </div>
        <div className="vf-stat">
          <div className="vf-stat-icon red">🚫</div>
          <div>
            <div className="vf-stat-label">Inactivas</div>
            <div className="vf-stat-value">{inactivas}</div>
            <div className="vf-stat-sub">{totalRegistros ? Math.round(inactivas / totalRegistros * 100) : 0}% del total</div>
          </div>
        </div>
        <div className="vf-stat">
          <div className="vf-stat-icon purple">📅</div>
          <div>
            <div className="vf-stat-label">Última carga</div>
            <div className="vf-stat-value" style={{ fontSize: 16 }}>
              {ultimaCarga
                ? new Date(ultimaCarga).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {datosVentas.length > 0 && (
          <div className="vf-preview-banner">
            ⚠️ Previsualización: {datosVentas.length} registros detectados como <strong>{tipoDetectado}</strong>. Revisa y confirma antes de guardar.
          </div>
        )}

        <div className="vf-table-wrap">
          <table className="vf-table">
            <thead>
              <tr>
                <th>SEGMENTO</th>
                <th>N° ORDEN</th>
                <th>RUT CLIENTE</th>
                <th>PRODUCTO</th>
                <th>DIRECCIÓN</th>
                <th>EJECUTIVO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {cargando && datosVentas.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Cargando datos…</td></tr>
              ) : paginada.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>No hay registros.</td></tr>
              ) : (
                paginada.map((v, i) => {
                  const seg      = v._segmento || v.segmento || '-';
                  const orden    = v.orden || v.numero_orden || '-';
                  const rut      = v.rut || v.rut_cliente || '-';
                  const producto = v.producto || '-';
                  const dir      = v.direccion || '-';
                  const ejecutivo = v.ejecutivo || (v.ejecutivos ? v.ejecutivos.nombre : 'Sin Asignar');
                  const estado   = v.estado || 'ACTIVA';
                  const segClass = ['PYME', 'SSPP', 'MASIVO'].includes(seg) ? seg : 'default';

                  return (
                    <tr key={v.id || i}>
                      <td><span className={`vf-seg ${segClass}`}>{seg}</span></td>
                      <td style={{ fontWeight: 500 }}>{orden}</td>
                      <td>{rut}</td>
                      <td><span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{producto}</span></td>
                      <td style={{ color: 'var(--gray-600)' }}>{dir}</td>
                      <td style={{ fontWeight: 500 }}>{ejecutivo.toUpperCase()}</td>
                      <td>
                        <span className={`vf-status ${estado === 'ACTIVA' ? 'active' : 'inactive'}`}>
                          <span className="dot" /> {estado}
                        </span>
                      </td>
                      <td>
                        <button className="vf-icon-btn" title="Ver detalle">👁</button>
                        <button className="vf-icon-btn" title="Más opciones">⋮</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="vf-pagination-row">
          <span>
            Mostrando {filtrada.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} a {Math.min(page * rowsPerPage, filtrada.length)} de {filtrada.length} registros
          </span>
          <div className="vf-rows-select">
            <span>Filas por página:</span>
            <select className="vf-select" value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}>
              {ROWS_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <PaginationButtons current={page} total={tp} onChange={setPage} />
        </div>
      </div>

      {/* ── Modal ── */}
      {modalAbierto && (
        <div
          className="vf-modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) { setModalAbierto(false); setTipoDetectado(null); setArchivo(null); } }}
        >
          <div className="vf-modal">
            <div className="vf-modal-header">
              <h3>Cargar Ventas Fijo</h3>
              <button className="vf-icon-btn" onClick={() => { setModalAbierto(false); setTipoDetectado(null); setArchivo(null); }}>✕</button>
            </div>
            <div className="vf-modal-body">
              <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-600)' }}>
                El nombre del archivo debe contener <strong>PYME</strong>, <strong>MASIVO</strong> o <strong>SSPP</strong>.
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="vf-file-input"
              />
              {tipoDetectado && (
                <div className="vf-detected-badge">✓ Tipo detectado: {tipoDetectado}</div>
              )}
            </div>
            <div className="vf-modal-footer">
              <button
                className="vf-btn vf-btn-outline"
                style={{ flex: 1 }}
                onClick={() => { setModalAbierto(false); setTipoDetectado(null); setArchivo(null); }}
              >
                Cancelar
              </button>
              <button
                className={`vf-btn ${tipoDetectado ? 'vf-btn-teal' : ''}`}
                style={{
                  flex: 2,
                  background: tipoDetectado ? undefined : 'var(--gray-200)',
                  color: tipoDetectado ? undefined : 'var(--gray-400)',
                  cursor: tipoDetectado ? 'pointer' : 'not-allowed',
                }}
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

export default VentasFijo;