import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { normalizarEjecutivo } from '../utils/normalizarEjecutivo';
import { useAuth } from '../context/AuthContext';

/* ─── Estilos Globales para Alertas de Calidad ─── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

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

  .pen-wrapper * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

  .pen-header { margin-bottom: 24px; }
  .pen-header h1 { font-size: 26px; font-weight: 800; color: var(--gray-900); margin: 0 0 4px; display: flex; align-items: center; gap: 10px; }
  .pen-header p  { font-size: 14px; color: var(--gray-600); margin: 0; }

  .pen-card {
    background: #fff;
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
    padding: 20px;
    margin-bottom: 16px;
  }

  .pen-filters { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 16px; }
  .pen-field { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 170px; }
  .pen-field label { font-size: 12px; font-weight: 600; color: var(--gray-600); }
  .pen-input {
    padding: 9px 14px;
    border: 1.5px solid var(--gray-200);
    border-radius: 8px;
    font-size: 14px;
    color: var(--gray-900);
    outline: none;
    transition: border-color .15s;
    width: 100%;
  }
  .pen-input:focus { border-color: var(--teal); }
  .pen-input::placeholder { color: var(--gray-400); }

  .pen-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 8px; font-size: 14px; font-weight: 600;
    cursor: pointer; border: none; transition: filter .15s, transform .1s;
    white-space: nowrap;
  }
  .pen-btn:active { transform: scale(.97); }
  .pen-btn-teal    { background: var(--teal);  color: #fff; }
  .pen-btn-teal:hover { filter: brightness(1.08); }
  .pen-btn-outline { background: #fff; color: var(--gray-700); border: 1.5px solid var(--gray-200); }
  .pen-btn-outline:hover { background: var(--gray-50); }
  .pen-btn-amber   { background: var(--amber); color: #fff; }
  .pen-btn-amber:hover { filter: brightness(1.06); }
  .pen-btn-blue    { background: #2563EB; color: #fff; }
  .pen-btn-blue:hover { filter: brightness(1.08); }

  .pen-actions-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .pen-left-actions { display: flex; gap: 8px; flex-wrap: wrap; }

  /* Stats */
  .pen-stats { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
  .pen-stat {
    display: flex; align-items: center; gap: 14px;
    flex: 1; min-width: 180px;
    padding: 16px 20px;
    background: #fff;
    border-radius: var(--radius);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
  }
  .pen-stat-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .pen-stat-icon.red    { background: var(--red-light);   color: var(--red); }
  .pen-stat-icon.amber  { background: #FEF3C7;           color: var(--amber-dark); }
  .pen-stat-icon.purple { background: var(--purple-light);color: var(--purple); }
  .pen-stat-icon.teal   { background: var(--teal-light);  color: var(--teal); }

  .pen-stat-label { font-size: 12px; color: var(--gray-600); margin-bottom: 2px; }
  .pen-stat-value { font-size: 22px; font-weight: 800; color: var(--gray-900); line-height: 1.1; }
  .pen-stat-sub   { font-size: 11px; color: var(--gray-400); margin-top: 3px; }

  /* Banner previsualizacion */
  .pen-preview-banner {
    background: #FFFBEB; color: #92400E;
    border-bottom: 1px solid #FDE68A;
    padding: 12px 20px; font-size: 13px; font-weight: 600;
    border-radius: var(--radius) var(--radius) 0 0;
    display: flex; justify-content: space-between; align-items: center;
  }

  /* Table */
  .pen-table-wrap { overflow-x: auto; }
  .pen-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .pen-table thead tr { background: var(--gray-50); border-bottom: 2px solid var(--gray-200); }
  .pen-table thead th {
    padding: 12px 14px; text-align: left;
    font-size: 11px; font-weight: 700; letter-spacing: .05em;
    color: var(--gray-600); text-transform: uppercase; white-space: nowrap;
  }
  .pen-table tbody tr { border-bottom: 1px solid var(--gray-100); transition: background .1s; }
  .pen-table tbody tr:hover { background: var(--gray-50); }
  .pen-table tbody td { padding: 12px 14px; color: var(--gray-700); white-space: nowrap; }

  /* Type badge */
  .pen-badge {
    padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700;
    display: inline-block; white-space: nowrap;
    background: #FEF3C7; color: #92400E;
  }

  /* Pagination */
  .pen-pagination-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-top: 1px solid var(--gray-100);
    font-size: 13px; color: var(--gray-600); flex-wrap: wrap; gap: 10px;
  }
  .pen-rows-select { display: flex; align-items: center; gap: 8px; }
  .pen-select {
    padding: 6px 28px 6px 10px; border-radius: 7px;
    border: 1.5px solid var(--gray-200); font-size: 13px;
    background: #fff; color: var(--gray-700); cursor: pointer; outline: none;
  }
  .pen-pg-buttons { display: flex; align-items: center; gap: 4px; }
  .pen-pg-btn {
    min-width: 32px; height: 32px; border-radius: 7px;
    border: 1.5px solid var(--gray-200);
    background: #fff; color: var(--gray-700);
    font-size: 13px; font-weight: 500;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .pen-pg-btn:hover:not(:disabled) { background: var(--gray-50); }
  .pen-pg-btn:disabled { opacity: .4; cursor: not-allowed; }
  .pen-pg-btn.active { background: var(--teal); color: #fff; border-color: var(--teal); }

  /* Modal */
  .pen-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,23,42,.45); backdrop-filter: blur(3px);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
  }
  .pen-modal {
    background: #fff; border-radius: 14px;
    width: 480px; max-width: 95vw;
    box-shadow: 0 20px 40px rgba(0,0,0,.18);
    overflow: hidden;
  }
  .pen-modal-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--gray-100);
    display: flex; align-items: center; justify-content: space-between;
  }
  .pen-modal-header h3 { margin: 0; font-size: 17px; font-weight: 700; color: var(--gray-900); }
  .pen-modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
  .pen-modal-footer { padding: 0 24px 20px; display: flex; gap: 10px; }

  .pen-file-input {
    padding: 18px;
    border: 2px dashed var(--gray-200);
    border-radius: 10px;
    font-size: 13px;
    color: var(--gray-600);
    cursor: pointer;
    width: 100%;
    background: var(--gray-50);
    text-align: center;
  }
  .pen-file-input:hover { border-color: var(--teal); background: var(--teal-light); }
`;

function StyleInjector() {
  useEffect(() => {
    if (document.getElementById('pen-styles-alerta')) return;
    const el = document.createElement('style');
    el.id = 'pen-styles-alerta';
    el.textContent = GLOBAL_STYLE;
    document.head.appendChild(el);
  }, []);
  return null;
}

function parseCSVLine(line) {
  // Simple CSV parser for semicolon separated values
  const result = [];
  let currentStr = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ';' && !inQuotes) {
      result.push(currentStr.trim());
      currentStr = '';
    } else {
      currentStr += c;
    }
  }
  result.push(currentStr.trim());
  return result;
}

export default function AlertasCalidad() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'ADMIN';

  const [modalAbierto, setModalAbierto] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [datosAlertas, setDatosAlertas] = useState([]); // Previsualización
  const [alertasDb, setAlertasDb] = useState([]);      // De Supabase
  const [cargando, setCargando] = useState(true);
  const [procesandoExcel, setProcesandoExcel] = useState(false);

  // Filtros
  const [searchEj, setSearchEj] = useState('');
  const [searchDoc, setSearchDoc] = useState('');
  const [filterPeriodo, setFilterPeriodo] = useState('TODOS');

  // Paginación
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    obtenerAlertas();
  }, [userProfile]); // Reload if role is loaded later

  const obtenerAlertas = async () => {
    if (!userProfile) return;
    setCargando(true);
    let query = supabase
      .from('penalizaciones')
      .select('*, ejecutivos!penalizaciones_ejecutivo_id_fkey(nombre)')
      .eq('tipo_penalizacion', 'Alerta')
      .order('id', { ascending: false });

    // RBAC logic
    if (userProfile?.role === 'EJECUTIVO') {
      if (userProfile.userId) {
         query = query.eq('ejecutivo_id', userProfile.userId);
      } else {
         query = query.ilike('nombre_ejecutivo', `%${userProfile.name}%`);
      }
    } else if (userProfile?.role === 'SUPERVISOR') {
      const allowedNames = userProfile.teamNames || [];
      if (allowedNames.length > 0) {
        query = query.in('nombre_ejecutivo', allowedNames);
      } else {
        query = query.eq('ejecutivo_id', '00000000-0000-0000-0000-000000000000'); // Force empty
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al consultar alertas:', error);
    } else {
      setAlertasDb(data || []);
    }
    setCargando(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
  };

  const procesarTablon = () => {
    if (!archivo) return alert('Por favor selecciona el archivo del Tablón (CSV).');

    setProcesandoExcel(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        
        if (lines.length < 2) {
          setProcesandoExcel(false);
          return alert('El archivo está vacío o no tiene formato válido.');
        }

        const headers = parseCSVLine(lines[0]).map(h => h.toUpperCase());
        
        // Find indexes
        const idxOrden = headers.indexOf('ORDEN');
        const idxRut = headers.indexOf('RUT_CLIENTE');
        const idxBaja = headers.indexOf('TIPO_BAJA');
        const idxEjecutivo = headers.indexOf('NOMBRE_EJECUTIVO_SELLER');
        const idxProducto = headers.indexOf('DESC_PRODUCTO');
        const idxPeriodo = headers.indexOf('PERIODO');
        const idxTransaccion = headers.indexOf('TIPO_TRANSACCION');

        if (idxOrden === -1 || idxEjecutivo === -1) {
          setProcesandoExcel(false);
          return alert('El CSV no tiene las columnas necesarias (ORDEN, NOMBRE_EJECUTIVO_SELLER). Verifica que sea el Tablón de Calidad separado por punto y coma.');
        }

        let alertas = [];
        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i]);
          if (row.length < headers.length) continue; // Skip incomplete lines

          const ordenRaw = row[idxOrden];
          const rutRaw = idxRut !== -1 ? row[idxRut] : '';
          const bajaRaw = idxBaja !== -1 ? row[idxBaja] : '';
          const ejecutivoRaw = normalizarEjecutivo(row[idxEjecutivo]);
          const productoRaw = idxProducto !== -1 ? row[idxProducto] : '';
          const periodoRaw = idxPeriodo !== -1 ? row[idxPeriodo] : '';
          const transaccionRaw = idxTransaccion !== -1 ? row[idxTransaccion] : '';

          if (ordenRaw && ejecutivoRaw && ejecutivoRaw.toUpperCase() !== 'EJECUTIVO') {
             alertas.push({
               ejecutivo: ejecutivoRaw,
               supervisor: '-',
               orden: ordenRaw,
               rut_cliente: rutRaw,
               producto: productoRaw,
               motivo_baja: bajaRaw || 'ALERTA DE BAJA',
               tipo_transaccion: transaccionRaw,
               periodo: periodoRaw,
               periodo_pago: '',
               tipo_penalizacion: 'Alerta',
               fecha: new Date().toISOString().split('T')[0],
             });
          }
        }

        if (alertas.length === 0) {
          setProcesandoExcel(false);
          return alert('No se encontraron alertas válidas en el archivo.');
        }

        setDatosAlertas(alertas);
        setModalAbierto(false);
        setProcesandoExcel(false);
      } catch (err) {
        setProcesandoExcel(false);
        alert('Error al leer el archivo del tablón: ' + err.message);
        console.error(err);
      }
    };
    reader.onerror = () => {
      setProcesandoExcel(false);
      alert('Error al abrir el archivo.');
    };
    // CSV are usually ANSI or UTF-8. Read as text.
    reader.readAsText(archivo, 'ISO-8859-1'); // Commonly used in Chile for CSVs
  };

  const guardarEnBD = async () => {
    try {
      // 1. Obtener ejecutivos registrados
      const { data: todosEj, error: ejError } = await supabase.from('ejecutivos').select('id, nombre, supervisor');
      if (ejError) throw new Error('Error al consultar ejecutivos: ' + ejError.message);

      // 2. Crear ejecutivos nuevos si no existen
      const nombresEnExcel = [...new Set(
        datosAlertas
          .map(p => (p.ejecutivo || '').trim().toUpperCase())
          .filter(n => n && n !== 'SIN SUPERVISOR' && n !== '-')
      )];

      const existentesSet = new Set((todosEj || []).map(e => e.nombre.trim().toUpperCase()));
      const nuevosNombres = nombresEnExcel.filter(n => !existentesSet.has(n));

      if (nuevosNombres.length > 0) {
        const { error: insertEjError } = await supabase
          .from('ejecutivos')
          .insert(nuevosNombres.map(nombre => ({ nombre })));
        if (insertEjError) throw new Error('Error al registrar nuevos ejecutivos: ' + insertEjError.message);
      }

      // 3. Recargar ejecutivos con IDs
      const { data: todosEjActualizados, error: ejError2 } = await supabase.from('ejecutivos').select('id, nombre, supervisor');
      if (ejError2) throw new Error('Error al recargar ejecutivos: ' + ejError2.message);

      const mapaEj = {};
      const mapaSupervisor = {};
      todosEjActualizados.forEach(e => {
        const nom = e.nombre.trim().toUpperCase();
        mapaEj[nom] = e.id;
        mapaSupervisor[nom] = e.supervisor || '-';
      });
      
      // Cargar alias de ejecutivos
      const { data: aliasData } = await supabase.from('ejecutivo_alias').select('alias, ejecutivo_id');
      if (aliasData) {
        aliasData.forEach(a => { mapaEj[a.alias.trim().toUpperCase()] = a.ejecutivo_id; });
      }

      // 4. Mapear registros de alerta
      const alertasFinales = datosAlertas.map(p => {
        const nombreEj = (p.ejecutivo || '').trim().toUpperCase();
        
        let foundEjecutivoId = mapaEj[nombreEj] || null;
        let foundEjecutivoNombre = p.ejecutivo;
        let foundSupervisor = mapaSupervisor[nombreEj] || p.supervisor;

        return {
          ejecutivo_id: foundEjecutivoId,
          supervisor_id: null, // We can skip supervisor ID matching for now since RBAC uses names too
          nombre_ejecutivo: foundEjecutivoNombre,
          nombre_supervisor: foundSupervisor,
          orden: p.orden,
          rut_cliente: p.rut_cliente,
          producto: p.producto,
          motivo_baja: p.motivo_baja,
          tipo_transaccion: p.tipo_transaccion,
          periodo: p.periodo,
          periodo_pago: p.periodo_pago,
          tipo_penalizacion: p.tipo_penalizacion,
          fecha: p.fecha,
        };
      });

      // 5. Deduplicar: obtener alertas existentes y filtrar las que ya están
      const ordenesExistentes = new Set();
      const { data: penExistentes } = await supabase.from('penalizaciones').select('orden, ejecutivo_id').eq('tipo_penalizacion', 'Alerta');
      if (penExistentes) {
        penExistentes.forEach(pe => {
          const key = String(pe.orden || '').trim().toUpperCase() + '|' + (pe.ejecutivo_id || '');
          ordenesExistentes.add(key);
        });
      }

      const alertasSinDuplicados = alertasFinales.filter(p => {
        const key = String(p.orden || '').trim().toUpperCase() + '|' + (p.ejecutivo_id || '');
        if (ordenesExistentes.has(key)) return false;
        ordenesExistentes.add(key);
        return true;
      });

      // Insertar en lotes de 500
      const BATCH_SIZE = 500;
      let totalInsertados = 0;
      for (let i = 0; i < alertasSinDuplicados.length; i += BATCH_SIZE) {
        const lote = alertasSinDuplicados.slice(i, i + BATCH_SIZE);
        const { error: insertError } = await supabase.from('penalizaciones').insert(lote);
        if (insertError) throw new Error(`Error en lote de inserción ${Math.floor(i / BATCH_SIZE) + 1}: ${insertError.message}`);
        totalInsertados += lote.length;
      }
      
      const duplicadosOmitidos = alertasFinales.length - alertasSinDuplicados.length;

      alert(`✅ Guardado exitoso: ${totalInsertados} alertas de calidad.${duplicadosOmitidos > 0 ? `\n⚠️ ${duplicadosOmitidos} registros duplicados fueron omitidos.` : ''}${nuevosNombres.length > 0 ? `\n👤 Ejecutivos nuevos integrados: ${nuevosNombres.join(', ')}` : ''}`);
      setDatosAlertas([]);
      setArchivo(null);
      obtenerAlertas();
    } catch (err) {
      alert('❌ Error al guardar en Supabase: ' + err.message);
      console.error(err);
    }
  };

  /* ─── Filtrado y datos ─── */
  const listaMostrada = datosAlertas.length > 0 ? datosAlertas : alertasDb;
  const periodosUnicos = ['TODOS', ...new Set(alertasDb.map(p => p.periodo).filter(Boolean))];

  const filtrada = listaMostrada.filter(p => {
    const ej = (p.ejecutivo || p.nombre_ejecutivo || (p.ejecutivos ? p.ejecutivos.nombre : '') || '').toLowerCase();
    const doc = (p.orden || p.rut_cliente || p.producto || '').toLowerCase();
    const per = p.periodo || '';

    const matchEj = !searchEj || ej.includes(searchEj.toLowerCase());
    const matchDoc = !searchDoc || doc.includes(searchDoc.toLowerCase());
    const matchPer = filterPeriodo === 'TODOS' || per === filterPeriodo;

    return matchEj && matchDoc && matchPer;
  });

  // KPIs
  const totalRegistros = alertasDb.length;
  const ordenesUnicasCount = new Set(alertasDb.map(p => p.orden).filter(Boolean)).size;
  const ejecutivosUnicosCount = new Set(alertasDb.map(p => p.ejecutivo_id || p.nombre_ejecutivo).filter(Boolean)).size;
  const ultimaCarga = alertasDb[0]?.created_at || alertasDb[0]?.fecha || null;

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtrada.length / rowsPerPage));
  const paginada = filtrada.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="pen-wrapper" style={{ padding: '28px 32px', background: 'var(--gray-50)', minHeight: '100vh' }}>
      <StyleInjector />

      {/* Header */}
      <div className="pen-header">
        <h1>
          <span>⚠️</span> Alertas de Calidad (Riesgo de Bajas)
        </h1>
        <p>Visualiza y gestiona las ventas que están en riesgo de ser penalizadas por caídas de calidad o morosidad.</p>
      </div>

      {/* Cards KPI */}
      <div className="pen-stats">
        <div className="pen-stat">
          <div className="pen-stat-icon amber">⚠️</div>
          <div>
            <div className="pen-stat-label">Total Alertas</div>
            <div className="pen-stat-value">{totalRegistros}</div>
            <div className="pen-stat-sub">Riesgos vigentes</div>
          </div>
        </div>

        <div className="pen-stat">
          <div className="pen-stat-icon red">🔢</div>
          <div>
            <div className="pen-stat-label">Órdenes Afectadas</div>
            <div className="pen-stat-value">{ordenesUnicasCount}</div>
            <div className="pen-stat-sub">Ventas en peligro</div>
          </div>
        </div>

        <div className="pen-stat">
          <div className="pen-stat-icon purple">👤</div>
          <div>
            <div className="pen-stat-label">Ejecutivos Involucrados</div>
            <div className="pen-stat-value">{ejecutivosUnicosCount}</div>
            <div className="pen-stat-sub">Impacto de la calidad</div>
          </div>
        </div>

        <div className="pen-stat">
          <div className="pen-stat-icon teal">📅</div>
          <div>
            <div className="pen-stat-label">Última Actualización</div>
            <div className="pen-stat-value" style={{ fontSize: 16 }}>
              {ultimaCarga
                ? new Date(ultimaCarga).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            </div>
            <div className="pen-stat-sub">Sincronizado</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="pen-card">
        <div className="pen-filters">
          <div className="pen-field">
            <label>Buscar Ejecutivo</label>
            <input
              className="pen-input"
              placeholder="Ej: Alejandra Leiva"
              value={searchEj}
              onChange={e => { setSearchEj(e.target.value); setPage(1); }}
            />
          </div>

          <div className="pen-field">
            <label>N° Orden / RUT / Producto</label>
            <input
              className="pen-input"
              placeholder="Ej: 1208057568 / 13988163K"
              value={searchDoc}
              onChange={e => { setSearchDoc(e.target.value); setPage(1); }}
            />
          </div>

          <div className="pen-field">
            <label>Período</label>
            <select
              className="pen-input"
              value={filterPeriodo}
              onChange={e => { setFilterPeriodo(e.target.value); setPage(1); }}
            >
              {periodosUnicos.map(p => (
                <option key={p} value={p}>{p === 'TODOS' ? 'Todos los períodos' : p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pen-actions-row">
          <div className="pen-left-actions">
            <button className="pen-btn pen-btn-outline" onClick={() => { setSearchEj(''); setSearchDoc(''); setFilterPeriodo('TODOS'); setPage(1); }}>
              ↺ Limpiar filtros
            </button>
            {isAdmin && datosAlertas.length > 0 && (
              <button className="pen-btn pen-btn-blue" onClick={guardarEnBD}>
                💾 Confirmar y Guardar en BD ({datosAlertas.length} registros)
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {isAdmin && (
              <button className="pen-btn pen-btn-amber" onClick={() => setModalAbierto(true)}>
                ⬆ Subir Tablón CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Banner de previsualización */}
      {datosAlertas.length > 0 && (
        <div className="pen-preview-banner" style={{ marginBottom: 16 }}>
          <div>
            ⚠️ Previsualización: Se extrajeron <strong>{datosAlertas.length}</strong> alertas de calidad del tablón. Haz clic en "Confirmar y Guardar en BD" para sincronizar con los perfiles.
          </div>
          <button className="pen-btn pen-btn-outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setDatosAlertas([])}>
            Cancelar
          </button>
        </div>
      )}

      {/* Tabla de Alertas */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div className="pen-table-wrap">
          <table className="pen-table">
            <thead>
              <tr>
                <th>ESTADO</th>
                <th>EJECUTIVO</th>
                <th>SUPERVISOR</th>
                <th>ORDEN / CELULAR</th>
                <th>CLIENTE (RUT)</th>
                <th>PRODUCTO</th>
                <th>MOTIVO DE ALERTA</th>
                <th>PERÍODO</th>
              </tr>
            </thead>
            <tbody>
              {cargando && datosAlertas.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
                    Cargando alertas de calidad...
                  </td>
                </tr>
              ) : paginada.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
                    No se encontraron alertas en los registros.
                  </td>
                </tr>
              ) : (
                paginada.map((p, index) => {
                  const nombreEj = p.ejecutivo || p.nombre_ejecutivo || (p.ejecutivos ? p.ejecutivos.nombre : 'Sin Asignar');
                  const nombreSup = p.supervisor || p.nombre_supervisor || '—';

                  return (
                    <tr key={p.id || index}>
                      <td>
                        <span className="pen-badge">
                          Alerta de Baja
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                        {nombreEj.toUpperCase()}
                      </td>
                      <td style={{ color: 'var(--gray-600)' }}>
                        {nombreSup}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {p.orden || '—'}
                      </td>
                      <td>
                        {p.rut_cliente || '—'}
                      </td>
                      <td style={{ color: 'var(--gray-600)' }}>
                        {p.producto || p.tipo_transaccion || '—'}
                      </td>
                      <td style={{ color: 'var(--red)', fontWeight: 600 }}>
                        {p.motivo_baja || '—'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {p.periodo || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="pen-pagination-row">
          <div className="pen-rows-select">
            <span>Filas por pág:</span>
            <select className="pen-select" value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div>
            Mostrando {Math.min((page - 1) * rowsPerPage + 1, filtrada.length)} - {Math.min(page * rowsPerPage, filtrada.length)} de {filtrada.length}
          </div>

          <div className="pen-pg-buttons">
            <button
              className="pen-pg-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              {'<'}
            </button>
            <span style={{ margin: '0 8px', fontWeight: 600 }}>Pág {page} de {totalPages}</span>
            <button
              className="pen-pg-btn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              {'>'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Subir CSV */}
      {modalAbierto && (
        <div className="pen-modal-overlay">
          <div className="pen-modal">
            <div className="pen-modal-header">
              <h3>⬆ Subir Tablón de Calidad</h3>
              <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }} onClick={() => setModalAbierto(false)}>&times;</button>
            </div>
            <div className="pen-modal-body">
              <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                Sube el archivo <strong>CSV (.csv)</strong> del Tablón de Calidad para identificar qué ventas están por penalizarse.
              </p>
              <input
                type="file"
                accept=".csv"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload" className="pen-file-input">
                {archivo ? <strong>{archivo.name}</strong> : '📁 Seleccionar archivo CSV...'}
              </label>
            </div>
            <div className="pen-modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button className="pen-btn pen-btn-outline" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button className="pen-btn pen-btn-teal" onClick={procesarTablon} disabled={!archivo || procesandoExcel}>
                {procesandoExcel ? '⏳ Leyendo...' : '✓ Extraer Datos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
