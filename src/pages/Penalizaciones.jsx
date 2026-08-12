import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { normalizarEjecutivo } from '../utils/normalizarEjecutivo';

/* ─── Estilos Globales para Penalizaciones ─── */
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
    if (document.getElementById('pen-styles')) return;
    const el = document.createElement('style');
    el.id = 'pen-styles';
    el.textContent = GLOBAL_STYLE;
    document.head.appendChild(el);
  }, []);
  return null;
}

function Penalizaciones() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [resumenHojas, setResumenHojas] = useState([]);
  const [datosPenalizaciones, setDatosPenalizaciones] = useState([]); // Previsualización
  const [penalizacionesDb, setPenalizacionesDb] = useState([]);      // De Supabase
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
    obtenerPenalizaciones();
  }, []);

  const obtenerPenalizaciones = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('penalizaciones')
      .select('*, ejecutivos!penalizaciones_ejecutivo_id_fkey(nombre)')
      .neq('tipo_penalizacion', 'Alerta')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error al consultar penalizaciones:', error);
      const fallback = await supabase
        .from('penalizaciones')
        .select('*')
        .neq('tipo_penalizacion', 'Alerta')
        .order('id', { ascending: false });
      if (fallback.data) setPenalizacionesDb(fallback.data);
    } else {
      setPenalizacionesDb(data || []);
    }
    setCargando(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'array' });
        const resumen = wb.SheetNames.map(sheetName => {
          const ws = wb.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
          return { sheetName, count: json.length };
        });
        setResumenHojas(resumen);
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const procesarArchivoPenalizaciones = () => {
    if (!archivo) return alert('Por favor selecciona un archivo de penalizaciones.');

    setProcesandoExcel(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        let todasLasPenalizaciones = [];

        // Filtrar hojas: Priorizar la hoja que se llame "Penalizaciones" o contenga "Penalizac"
        let targetSheets = wb.SheetNames.filter(name => name.trim().toUpperCase().includes('PENALIZAC'));
        if (targetSheets.length === 0) {
          // Si no existe una hoja con ese nombre específico, procesar la primera hoja o todas
          targetSheets = wb.SheetNames;
        }

        targetSheets.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          if (!ws) return;
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

          rows.forEach(r => {
            const ejecutivoRaw = normalizarEjecutivo(String(
              r['EJECUTIVO'] || r['Ejecutivo'] || r['ejecutivo'] || r['EJECUTIVO_ESTANDAR'] || ''
            ).trim());

            if (!ejecutivoRaw || ejecutivoRaw.toUpperCase() === 'EJECUTIVO') return;

            const supervisorRaw = String(r['SUPERVISOR'] || r['Supervisor'] || r['supervisor'] || '').trim();
            const ordenRaw = String(r['ID_GENERICO'] || r['Id_Generico'] || r['ORDEN'] || r['Orden'] || r['CELULAR'] || r['Celular'] || r['ID'] || '').trim();
            const rutClienteRaw = String(r['RUT_CLIENTE'] || r['Rut_Cliente'] || r['RUT CLIENTE'] || r['RUT'] || '').trim();
            const productoRaw = String(r['PRODUCTO'] || r['Producto'] || r['DESC_PRODUCTO'] || '').trim();
            const motivoRaw = String(r['MOTIVO_BAJA'] || r['Motivo_Baja'] || r['MOTIVO'] || r['TIPO_TRANSACCION'] || r['DESCRIPCION'] || '').trim();
            const transaccionRaw = String(r['TIPO_TRANSACCION'] || r['Tipo_Transaccion'] || '').trim();
            const periodoRaw = String(r['MES_COBRADA_BAJA'] || r['MES_COBRADA_B'] || r['MES_COBRADO'] || r['PERIODO_PENALIZACION'] || r['PERIODO_PAGO'] || r['PERIODO'] || '').trim();
            const periodoPagoRaw = String(r['PERIODO_PAGO'] || r['Periodo_Pago'] || '').trim();

            let fechaRaw = String(r['FECHA_EMISION'] || r['FECHA_TERMINO'] || r['FECHA'] || '').replace(/\D/g, '');
            let fechaFormatted = new Date().toISOString().split('T')[0];
            if (fechaRaw.length === 8) {
              fechaFormatted = `${fechaRaw.slice(0,4)}-${fechaRaw.slice(4,6)}-${fechaRaw.slice(6,8)}`;
            }

            todasLasPenalizaciones.push({
              ejecutivo: ejecutivoRaw,
              supervisor: supervisorRaw,
              orden: ordenRaw,
              rut_cliente: rutClienteRaw,
              producto: productoRaw,
              motivo_baja: motivoRaw,
              tipo_transaccion: transaccionRaw,
              periodo: periodoRaw,
              periodo_pago: periodoPagoRaw,
              tipo_penalizacion: 'Penalizaciones',
              fecha: fechaFormatted,
            });
          });
        });

        if (todasLasPenalizaciones.length === 0) {
          setProcesandoExcel(false);
          return alert('No se encontraron registros de penalizaciones válidos.');
        }

        setDatosPenalizaciones(todasLasPenalizaciones);
        setModalAbierto(false);
        setProcesandoExcel(false);
      } catch (err) {
        setProcesandoExcel(false);
        alert('Error al leer el archivo de penalizaciones: ' + err.message);
        console.error(err);
      }
    };
    reader.onerror = () => {
      setProcesandoExcel(false);
      alert('Error al abrir el archivo.');
    };
    reader.readAsArrayBuffer(archivo);
  };

  const guardarEnBD = async () => {
    try {
      // 1. Obtener ejecutivos registrados
      const { data: todosEj, error: ejError } = await supabase.from('ejecutivos').select('id, nombre');
      if (ejError) throw new Error('Error al consultar ejecutivos: ' + ejError.message);

      // 2. Crear ejecutivos nuevos si no existen
      const nombresEnExcel = [...new Set(
        datosPenalizaciones
          .flatMap(p => [p.ejecutivo, p.supervisor])
          .map(n => (n || '').trim().toUpperCase())
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
      const { data: todosEjActualizados, error: ejError2 } = await supabase.from('ejecutivos').select('id, nombre');
      if (ejError2) throw new Error('Error al recargar ejecutivos: ' + ejError2.message);

      const mapaEj = {};
      todosEjActualizados.forEach(e => {
        mapaEj[e.nombre.trim().toUpperCase()] = e.id;
      });
      
      // Cargar alias de ejecutivos
      const { data: aliasData } = await supabase.from('ejecutivo_alias').select('alias, ejecutivo_id');
      if (aliasData) {
        aliasData.forEach(a => { mapaEj[a.alias.trim().toUpperCase()] = a.ejecutivo_id; });
      }

      // 4. Buscar las ventas correspondientes para cruzar los IDs y actualizar los estados correctamente
      // Extract unique numeric base orders for querying ventas table
      const numericOrders = [...new Set(datosPenalizaciones.map(p => {
        const raw = String(p.orden || '').trim();
        return raw.replace(/\D/g, '');
      }).filter(Boolean))];
      const matchedVentasMap = {};
      const matchedVentasIds = [];

      for (let i = 0; i < numericOrders.length; i += 100) {
        const batch = numericOrders.slice(i, i + 100);
        const { data: vtas } = await supabase.from('ventas').select('id, numero_orden, producto, ejecutivo_id').in('numero_orden', batch);
        if (vtas) {
          vtas.forEach(v => {
            if (!matchedVentasMap[v.numero_orden]) matchedVentasMap[v.numero_orden] = [];
            matchedVentasMap[v.numero_orden].push(v);
          });
        }
      }

      // 5. Mapear registros de penalización
      const penalizacionesFinales = datosPenalizaciones.map(p => {
        const nombreEj = (p.ejecutivo || '').trim().toUpperCase();
        const nombreSup = (p.supervisor || '').trim().toUpperCase();
        
        const rawOrden = String(p.orden || '').trim().toUpperCase();
        const numOrden = rawOrden.replace(/\D/g, '');
        
        let foundEjecutivoId = mapaEj[nombreEj] || null;
        let foundEjecutivoNombre = p.ejecutivo;

        // Intentar cruce exacto con la venta para heredar el ejecutivo real y marcarla como penalizada
        const posiblesVentas = matchedVentasMap[numOrden];
        if (posiblesVentas && posiblesVentas.length > 0) {
          let matchedVenta = posiblesVentas.find(v => {
            const prodAbrev = String(v.producto || '').split(' ')[0].trim().toUpperCase();
            return rawOrden === String(v.numero_orden) || (rawOrden.startsWith(numOrden) && rawOrden.includes(prodAbrev));
          });
          
          if (matchedVenta) {
            foundEjecutivoId = matchedVenta.ejecutivo_id;
            const correctEj = todosEjActualizados.find(e => e.id === foundEjecutivoId);
            if (correctEj) foundEjecutivoNombre = correctEj.nombre;
            matchedVentasIds.push(matchedVenta.id);
          }
        }

        return {
          ejecutivo_id: foundEjecutivoId,
          supervisor_id: mapaEj[nombreSup] || null,
          nombre_ejecutivo: foundEjecutivoNombre,
          nombre_supervisor: p.supervisor,
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

      // 5. Deduplicar: obtener penalizaciones existentes y filtrar las que ya están
      const ordenesExistentes = new Set();
      const { data: penExistentes } = await supabase.from('penalizaciones').select('orden, ejecutivo_id').neq('tipo_penalizacion', 'Alerta');
      if (penExistentes) {
        penExistentes.forEach(pe => {
          const key = String(pe.orden || '').trim().toUpperCase() + '|' + (pe.ejecutivo_id || '');
          ordenesExistentes.add(key);
        });
      }

      const penalizacionesSinDuplicados = penalizacionesFinales.filter(p => {
        const key = String(p.orden || '').trim().toUpperCase() + '|' + (p.ejecutivo_id || '');
        if (ordenesExistentes.has(key)) return false;
        ordenesExistentes.add(key); // Also prevent duplicates within the same upload
        return true;
      });

      // Insertar en lotes de 500
      const BATCH_SIZE = 500;
      let totalInsertados = 0;
      for (let i = 0; i < penalizacionesSinDuplicados.length; i += BATCH_SIZE) {
        const lote = penalizacionesSinDuplicados.slice(i, i + BATCH_SIZE);
        const { error: insertError } = await supabase.from('penalizaciones').insert(lote);
        if (insertError) throw new Error(`Error en lote de inserción ${Math.floor(i / BATCH_SIZE) + 1}: ${insertError.message}`);
        totalInsertados += lote.length;
      }
      
      const duplicadosOmitidos = penalizacionesFinales.length - penalizacionesSinDuplicados.length;

      // 7. Marcar ventas exactas en la tabla `ventas` como PENALIZADA
      if (matchedVentasIds.length > 0) {
        const uniqueIds = [...new Set(matchedVentasIds)];
        for (let i = 0; i < uniqueIds.length; i += 100) {
          const loteIds = uniqueIds.slice(i, i + 100);
          await supabase
            .from('ventas')
            .update({ estado: 'PENALIZADA' })
            .in('id', loteIds);
        }
      }

      alert(`✅ Guardado exitoso: ${totalInsertados} registros de penalizaciones.${duplicadosOmitidos > 0 ? `\n⚠️ ${duplicadosOmitidos} registros duplicados fueron omitidos.` : ''}${nuevosNombres.length > 0 ? `\n👤 Ejecutivos nuevos integrados: ${nuevosNombres.join(', ')}` : ''}`);
      setDatosPenalizaciones([]);
      setArchivo(null);
      obtenerPenalizaciones();
    } catch (err) {
      alert('❌ Error al guardar en Supabase: ' + err.message);
      console.error(err);
    }
  };

  /* ─── Filtrado y datos ─── */
  const listaMostrada = datosPenalizaciones.length > 0 ? datosPenalizaciones : penalizacionesDb;
  const periodosUnicos = ['TODOS', ...new Set(penalizacionesDb.map(p => p.periodo).filter(Boolean))];

  const filtrada = listaMostrada.filter(p => {
    const ej = (p.ejecutivo || p.nombre_ejecutivo || (p.ejecutivos ? p.ejecutivos.nombre : '') || '').toLowerCase();
    const doc = (p.orden || p.rut_cliente || p.producto || '').toLowerCase();
    const per = p.periodo || '';

    const matchEj = !searchEj || ej.includes(searchEj.toLowerCase());
    const matchDoc = !searchDoc || doc.includes(searchDoc.toLowerCase());
    const matchPer = filterPeriodo === 'TODOS' || per === filterPeriodo;

    return matchEj && matchDoc && matchPer;
  });

  const descargarPenalizaciones = () => {
    if (filtrada.length === 0) {
      return alert('No hay penalizaciones para descargar con los filtros actuales.');
    }

    const dataExcel = filtrada.map(p => ({
      'Ejecutivo': p.ejecutivo || p.nombre_ejecutivo || (p.ejecutivos ? p.ejecutivos.nombre : '') || '-',
      'Supervisor': p.supervisor || p.nombre_supervisor || '-',
      'Orden / Celular': p.orden || '-',
      'Cliente (RUT)': p.rut_cliente || '-',
      'Producto / Motivo': p.motivo_baja || p.producto || p.tipo_transaccion || '-',
      'Período Cobrado': p.periodo || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Penalizaciones");
    
    const nombreArchivo = `Penalizaciones_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);
  };

  // KPIs
  const totalRegistros = penalizacionesDb.length;
  const ordenesUnicasCount = new Set(penalizacionesDb.map(p => p.orden).filter(Boolean)).size;
  const ejecutivosUnicosCount = new Set(penalizacionesDb.map(p => p.ejecutivo_id || p.nombre_ejecutivo).filter(Boolean)).size;
  const ultimaCarga = penalizacionesDb[0]?.created_at || penalizacionesDb[0]?.fecha || null;

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtrada.length / rowsPerPage));
  const paginada = filtrada.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="pen-wrapper" style={{ padding: '28px 32px', background: 'var(--gray-50)', minHeight: '100vh' }}>
      <StyleInjector />

      {/* Header */}
      <div className="pen-header">
        <h1>
          <span>🚨</span> Carga y Registro de Penalizaciones
        </h1>
        <p>Importa las ventas penalizadas desde la hoja <strong>Penalizaciones</strong> para actualizar las métricas por ejecutivo.</p>
      </div>

      {/* Cards KPI */}
      <div className="pen-stats">
        <div className="pen-stat">
          <div className="pen-stat-icon red">📋</div>
          <div>
            <div className="pen-stat-label">Total Penalizaciones</div>
            <div className="pen-stat-value">{totalRegistros}</div>
            <div className="pen-stat-sub">Registros importados</div>
          </div>
        </div>

        <div className="pen-stat">
          <div className="pen-stat-icon amber">🔢</div>
          <div>
            <div className="pen-stat-label">Órdenes Únicas</div>
            <div className="pen-stat-value">{ordenesUnicasCount}</div>
            <div className="pen-stat-sub">N° de Órdenes penalizadas</div>
          </div>
        </div>

        <div className="pen-stat">
          <div className="pen-stat-icon purple">👤</div>
          <div>
            <div className="pen-stat-label">Ejecutivos Penalizados</div>
            <div className="pen-stat-value">{ejecutivosUnicosCount}</div>
            <div className="pen-stat-sub">Con registros asociados</div>
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
            {datosPenalizaciones.length > 0 && (
              <button className="pen-btn pen-btn-blue" onClick={guardarEnBD}>
                💾 Confirmar y Guardar en BD ({datosPenalizaciones.length} registros)
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="pen-btn pen-btn-outline" onClick={descargarPenalizaciones} style={{ backgroundColor: '#10B981', color: 'white', borderColor: '#10B981' }}>
              📥 Descargar Penalizaciones
            </button>
            <button className="pen-btn pen-btn-amber" onClick={() => setModalAbierto(true)}>
              ⬆ Cargar Excel Penalizaciones
            </button>
          </div>
        </div>
      </div>

      {/* Banner de previsualización */}
      {datosPenalizaciones.length > 0 && (
        <div className="pen-preview-banner" style={{ marginBottom: 16 }}>
          <div>
            ⚠️ Previsualización: Se extrajeron <strong>{datosPenalizaciones.length}</strong> penalizaciones. Haz clic en "Confirmar y Guardar en BD" para sincronizar con los perfiles.
          </div>
          <button className="pen-btn pen-btn-outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setDatosPenalizaciones([])}>
            Cancelar
          </button>
        </div>
      )}

      {/* Tabla de Penalizaciones */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div className="pen-table-wrap">
          <table className="pen-table">
            <thead>
              <tr>
                <th>HOJA / TIPO</th>
                <th>EJECUTIVO</th>
                <th>SUPERVISOR</th>
                <th>ORDEN / CELULAR</th>
                <th>CLIENTE (RUT)</th>
                <th>PRODUCTO / MOTIVO</th>
                <th>PERÍODO</th>
                <th>PERFIL</th>
              </tr>
            </thead>
            <tbody>
              {cargando && datosPenalizaciones.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
                    Cargando penalizaciones...
                  </td>
                </tr>
              ) : paginada.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
                    No se encontraron penalizaciones registradas.
                  </td>
                </tr>
              ) : (
                paginada.map((p, index) => {
                  const nombreEj = p.ejecutivo || p.nombre_ejecutivo || (p.ejecutivos ? p.ejecutivos.nombre : 'Sin Asignar');
                  const nombreSup = p.supervisor || p.nombre_supervisor || '—';
                  const ejId = p.ejecutivo_id;

                  return (
                    <tr key={p.id || index}>
                      <td>
                        <span className="pen-badge">
                          Penalizaciones
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
                        {p.motivo_baja || p.producto || '—'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {p.periodo || '—'}
                      </td>
                      <td>
                        {ejId ? (
                          <Link
                            to={`/ejecutivos/${ejId}`}
                            style={{
                              color: 'var(--teal)',
                              fontWeight: 600,
                              textDecoration: 'none',
                              fontSize: 12,
                            }}
                          >
                            👁 Ver Perfil
                          </Link>
                        ) : (
                          <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>—</span>
                        )}
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
          <span>
            Mostrando {filtrada.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} a {Math.min(page * rowsPerPage, filtrada.length)} de {filtrada.length} penalizaciones
          </span>

          <div className="pen-rows-select">
            <span>Filas por página:</span>
            <select
              className="pen-select"
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
            >
              {[10, 25, 50, 100].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="pen-pg-buttons">
            <button
              className="pen-pg-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            <span style={{ padding: '0 8px', fontWeight: 600 }}>
              {page} / {totalPages}
            </span>
            <button
              className="pen-pg-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Modal Carga Excel */}
      {modalAbierto && (
        <div
          className="pen-modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setModalAbierto(false); }}
        >
          <div className="pen-modal">
            <div className="pen-modal-header">
              <h3>Subir Excel Penalizaciones</h3>
              <button
                className="pen-btn pen-btn-outline"
                style={{ padding: '4px 8px' }}
                onClick={() => setModalAbierto(false)}
              >
                ✕
              </button>
            </div>
            <div className="pen-modal-body">
              <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>
                Selecciona el archivo Excel. Se extraerán automáticamente las ventas penalizadas desde la hoja <strong>Penalizaciones</strong>.
              </p>

              <input
                type="file"
                accept=".xlsx,.xls,.xlsm"
                onChange={handleFileSelect}
                className="pen-file-input"
              />

              {resumenHojas.length > 0 && (
                <div style={{ background: '#F1F5F9', borderRadius: 8, padding: 12, fontSize: 12 }}>
                  <strong style={{ color: 'var(--gray-900)' }}>Hojas detectadas:</strong>
                  <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    {resumenHojas.map(h => (
                      <li key={h.sheetName}>
                        <strong>{h.sheetName}</strong>: {h.count} filas
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pen-modal-footer">
              <button
                className="pen-btn pen-btn-outline"
                style={{ flex: 1 }}
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </button>

              <button
                className="pen-btn pen-btn-teal"
                style={{ flex: 2, opacity: archivo && !procesandoExcel ? 1 : 0.6 }}
                onClick={procesarArchivoPenalizaciones}
                disabled={!archivo || procesandoExcel}
              >
                {procesandoExcel ? 'Procesando...' : 'Procesar y Extraer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Penalizaciones;
