import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/* ─── Paleta ─────────────────────────────────────────────────────── */
const T = {
  teal:    '#00897B',
  tealDk:  '#00695C',
  tealLt:  '#E0F2F1',
  blue:    '#1E88E5',
  orange:  '#FB8C00',
  purple:  '#8E24AA',
  red:     '#E53935',
  green:   '#43A047',
  gray50:  '#F8FAFB',
  gray100: '#F0F4F5',
  gray200: '#E2E8EA',
  gray400: '#9EAAB0',
  gray600: '#4A5568',
  gray800: '#1A2332',
  white:   '#FFFFFF',
};

const pill = (bg, color) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  backgroundColor: bg, color,
  padding: '3px 10px', borderRadius: 20,
  fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
  whiteSpace: 'nowrap',
});

const card = (extra = {}) => ({
  backgroundColor: T.white,
  borderRadius: 14,
  boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)',
  ...extra,
});

const btnBase = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  border: 'none', borderRadius: 8, cursor: 'pointer',
  fontWeight: 600, fontSize: 13, padding: '9px 16px',
  transition: 'all 0.15s',
};

/* ─── Iconos SVG ─────────────────────────────────────────────────── */
const IcoUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const IcoSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IcoX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IcoEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcoDots = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);
const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcoSort = ({ active, dir }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: active ? 1 : 0.3 }}>
    {dir === 'desc'
      ? <polyline points="6 9 12 15 18 9"/>
      : <polyline points="18 15 12 9 6 15"/>}
  </svg>
);
const IcoChevL = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IcoChevR = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IcoInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IcoTrend = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

/* ─── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ icon, value, label, sub, color, onClick, selected }) {
  return (
    <div onClick={onClick} style={{ ...card(), padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 160, cursor: onClick ? "pointer" : "default", border: selected ? `2px solid ${color}` : "2px solid transparent", transition: "all 0.2s", transform: selected ? "translateY(-2px)" : "none", boxShadow: selected ? `0 4px 12px ${color}33` : "0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.gray600, marginTop: 2 }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 11, color: T.green, display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}>
            <IcoTrend /> {sub}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Drop Zone ──────────────────────────────────────────────────── */
function DropZone({ onFile }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  const handle = (f) => f && onFile(f);
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => ref.current.click()}
      style={{ border: `2px dashed ${drag ? T.teal : T.gray200}`, borderRadius: 12, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', backgroundColor: drag ? T.tealLt : T.gray50, transition: 'all 0.2s' }}
    >
      <input ref={ref} type="file" accept=".xlsx,.xls,.xlsm" style={{ display: 'none' }} onChange={e => handle(e.target.files[0])} />
      <div style={{ color: T.teal, marginBottom: 8, display: 'flex', justifyContent: 'center' }}><IcoUpload /></div>
      <div style={{ color: T.gray600, fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Arrastra y suelta tu archivo aquí</div>
      <div style={{ color: T.gray400, fontSize: 12, marginBottom: 4 }}>o selecciona un archivo desde tu equipo</div>
      <div style={{ color: T.gray400, fontSize: 11, marginBottom: 16 }}>Formatos permitidos: .xlsx, .xls, .xlsm</div>
      <button onClick={e => { e.stopPropagation(); ref.current.click(); }}
        style={{ ...btnBase, backgroundColor: T.teal, color: T.white }}>
        <IcoSave /> Seleccionar archivo
      </button>
    </div>
  );
}

/* ─── Canal Badge ─────────────────────────────────────────────────── */
function CanalBadge({ canal }) {
  if (!canal) return <span style={pill(T.gray100, T.gray600)}>Sin Canal</span>;
  const lc = canal.toLowerCase();
  if (lc.includes('masivo')) return <span style={pill('#FFF3E0', T.orange)}>{canal}</span>;
  if (lc.includes('pyme'))   return <span style={pill('#E8F5E9', T.green)}>{canal}</span>;
  return <span style={pill('#EDE7F6', T.purple)}>{canal}</span>;
}

/* ─── Componente principal ───────────────────────────────────────── */
const POR_PAGINA = 10;

function Ejecutivos() {
  const [ejecutivos, setEjecutivos] = useState([]);
  const [groupStats, setGroupStats] = useState({ cargando: false, totales: 0, penalizadas: 0, tasa: 0, ventasOk: 0, datosOrdenados: [] });
  const [cargando, setCargando]     = useState(true);
  const [archivo, setArchivo]       = useState(null);
  const [tipoSim, setTipoSim]       = useState(null);
  const [datosNuevos, setDatos]     = useState([]);
  const [busqueda, setBusqueda]     = useState('');
  const [filtroC, setFiltroC]       = useState('TODOS');
  const [filtroK, setFiltroK]       = useState('TODOS');
  const [pagina, setPagina]         = useState(1);
  const [sortCol, setSortCol]       = useState('nombre');
  const [sortDir, setSortDir]       = useState('asc');
  
  const [editForm, setEditForm]     = useState(null);
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  const obtener = async () => {
    setCargando(true);
    const { data } = await supabase.from('ejecutivos').select('*').order('nombre', { ascending: true });
    setEjecutivos(data || []);
    setCargando(false);
  };

  useEffect(() => {
    if (ejecutivos.length === 0) return;
    
    const fetchStats = async () => {
      setGroupStats(prev => ({ ...prev, cargando: true }));
      
      const ejecutivosGrupo = ejecutivos.filter(e => {
          if (filtroC === 'CONTRATADO') return e.tipo_contrato !== 'FREELANCE' && e.tipo_contrato !== 'FREELANCE EMPRESA';
          if (filtroC === 'FREELANCE') return e.tipo_contrato === 'FREELANCE';
          if (filtroC === 'FREELANCE EMPRESA') return e.tipo_contrato === 'FREELANCE EMPRESA';
          return true;
      });
      const idsGrupo = ejecutivosGrupo.map(e => e.id);
      
      if (idsGrupo.length === 0) {
        setGroupStats({ cargando: false, totales: 0, penalizadas: 0, tasa: 0, ventasOk: 0, datosOrdenados: [] });
        return;
      }
      
      let allVentas = [];
      let allPen = [];
      const chunkSize = 150;
      
      try {
        for (let i = 0; i < idsGrupo.length; i += chunkSize) {
          const chunk = idsGrupo.slice(i, i + chunkSize);
          
          const [venRes, penRes] = await Promise.all([
            supabase.from('ventas').select('numero_orden, estado, fecha_ingreso').in('ejecutivo_id', chunk),
            supabase.from('penalizaciones').select('orden').in('ejecutivo_id', chunk)
          ]);
          
          if (venRes.data) allVentas = allVentas.concat(venRes.data);
          if (penRes.data) allPen = allPen.concat(penRes.data);
        }
        
        const penalizedOrdersGroup = {};
        allPen.forEach(p => {
          const rawOrden = String(p.orden || '').trim().toUpperCase();
          const justDigits = rawOrden.replace(/\D/g, ''); 
          if (justDigits) {
            penalizedOrdersGroup[justDigits] = true;
          } else if (rawOrden) {
            penalizedOrdersGroup[rawOrden] = true;
          }
        });

        const ventasProcesadas = allVentas.map(v => {
          const numOrdenRaw = String(v.numero_orden || '').trim().toUpperCase();
          const numOrden = numOrdenRaw.replace(/\D/g, '') || numOrdenRaw;
          const pMatch = penalizedOrdersGroup[numOrden];
          const esPenalizada = !!pMatch || (v.estado === 'CAIDA' || v.estado === 'RECHAZADA' || v.estado === 'PENALIZADA');
          return { ...v, esPenalizada };
        });
        
        const totales = ventasProcesadas.length;
        const penalizadas = ventasProcesadas.filter(v => v.esPenalizada).length;
        const ventasOk = totales - penalizadas;
        const tasa = totales > 0 ? Math.round((penalizadas / totales) * 100) : 0;
        
        const agrupadoPorMes = {};
        ventasProcesadas.forEach((venta) => {
          const mes = venta.fecha_ingreso ? venta.fecha_ingreso.substring(0, 7) : 'Sin fecha';
          if (!agrupadoPorMes[mes]) agrupadoPorMes[mes] = { periodo: mes, ventas: 0, penalizadas: 0 };
          agrupadoPorMes[mes].ventas += 1;
          if (venta.esPenalizada) agrupadoPorMes[mes].penalizadas += 1;
        });
        const datosOrdenados = Object.values(agrupadoPorMes).sort((a, b) => a.periodo.localeCompare(b.periodo));
        
        setGroupStats({ cargando: false, totales, penalizadas, ventasOk, tasa, datosOrdenados });
      } catch (err) {
        console.error("Error al cargar stats:", err);
        setGroupStats(prev => ({ ...prev, cargando: false }));
      }
    };
    
    fetchStats();
  }, [filtroC, ejecutivos]);

  const handleFile = (f) => {
    const fn = f.name.toUpperCase();
    setTipoSim(fn.includes('PYME') ? 'PYME' : fn.includes('MASIVO') ? 'MASIVO' : null);
    setArchivo(f);
  };

  const procesar = () => {
    if (!archivo || !tipoSim) return alert('Tipo no identificado. El nombre debe contener PYME o MASIVO.');
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const ws = wb.Sheets['Datos'];
      if (!ws) return alert('No se encontró la hoja "Datos".');

      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      let hRow = -1;
      for (let i = 0; i < raw.length; i++) {
        const s = raw[i].join('|').toUpperCase();
        if (tipoSim === 'MASIVO' && s.includes('APODO') && s.includes('RUT')) { hRow = i; break; }
        if (tipoSim === 'PYME'   && s.includes('NOMBRE') && s.includes('RUT'))  { hRow = i; break; }
      }
      if (hRow === -1) return alert('No se encontró la cabecera.');

      const headers = raw[hRow];
      const rows    = raw.slice(hRow + 1);
      const idx = {};
      headers.forEach((h, i) => { if (h) idx[h.toString().trim().toUpperCase()] = i; });

      const resultado = [];
      const vistos    = new Set();
      let supActual   = '';

      rows.forEach(row => {
        if (!row?.some(Boolean)) return;
        let nombre, rut, cargo, supervisor, contrato;
        if (tipoSim === 'MASIVO') {
          nombre = (row[idx['APODO']] || row[idx['NOMBRE_COMPLETO']] || '').toString().trim();
          rut = (row[idx['RUT']] || '').toString().trim();
          cargo = (row[idx['CARGO']] || '').toString().trim();
          supervisor = (row[idx['EQUIPO']] || '').toString().trim();
          contrato = row[idx['CONTRATO']];
        } else {
          nombre = (row[idx['NOMBRE CIERRE']] || row[idx['NOMBRE']] || '').toString().trim();
          rut = (row[idx['RUT']] || '').toString().trim();
          cargo = (row[idx['CARGO']] || '').toString().trim();
          supervisor = (row[idx['EQUIPO']] || '').toString().trim();
          contrato = row[idx['CONTRATO']];
        }
        if (!nombre || !rut || rut.toUpperCase() === 'RUT') return;
        if (nombre.toUpperCase() === 'NOMBRE' || nombre.toUpperCase() === 'APODO') return;
        if (vistos.has(rut)) return;
        vistos.add(rut);

        const esSup = cargo.toLowerCase().includes('supervisor') && !supervisor;
        if (esSup) supActual = nombre;

        const esFL = contrato === 2 || contrato === '2' || contrato === 2.0;
        resultado.push({
          nombre, rut, cargo,
          canal: tipoSim === 'MASIVO' ? 'Masivo Fijo' : 'Pyme Móvil',
          supervisor: esSup ? '' : (supervisor || supActual || 'Sin Supervisor'),
          tipo_contrato: esFL ? 'FREELANCE' : 'CONTRATADO',
          es_supervisor: esSup,
          correo: 'pendiente@tsales.cl',
          activo: true,
        });
      });

      setDatos(resultado);
      alert(`✓ ${resultado.length} registros.\nContratados: ${resultado.filter(e=>e.tipo_contrato==='CONTRATADO').length} | Freelance: ${resultado.filter(e=>e.tipo_contrato==='FREELANCE').length} | Supervisores: ${resultado.filter(e=>e.es_supervisor).length}`);
    };
    reader.readAsArrayBuffer(archivo);
  };

  const guardar = async () => {
    const { data: ex } = await supabase.from('ejecutivos').select('rut');
    const existentes = new Set((ex || []).map(e => e.rut));
    const nuevos = datosNuevos.filter(e => !existentes.has(e.rut));
    if (!nuevos.length) return alert(`Todos ya existen (${datosNuevos.length} duplicados).`);
    const { error } = await supabase.from('ejecutivos').insert(nuevos);
    if (error) return alert('Error: ' + error.message);
    alert(`¡Éxito! ${nuevos.length} ejecutivos guardados.`);
    setDatos([]); setArchivo(null); setTipoSim(null);
    obtener();
  };

  const handleGuardarEdit = async () => {
    if (!editForm.nombre?.trim()) return alert('El nombre es obligatorio');
    setGuardandoEdit(true);
    try {
      const { error } = await supabase.from('ejecutivos').update({
        nombre: editForm.nombre,
        rut: editForm.rut,
        cargo: editForm.cargo,
        canal: editForm.canal,
        supervisor: editForm.supervisor,
        tipo_contrato: editForm.tipo_contrato,
        activo: editForm.activo
      }).eq('id', editForm.id);
      
      if (error) throw error;
      
      setEjecutivos(prev => prev.map(e => e.id === editForm.id ? { ...e, ...editForm } : e));
      setEditForm(null);
      alert('¡Ejecutivo actualizado correctamente!');
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setGuardandoEdit(false);
    }
  };

  const canalesUnicos = ['TODOS', ...new Set(ejecutivos.map(e => e.canal).filter(Boolean))];

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPagina(1);
  };

  const fuente   = datosNuevos.length > 0 ? datosNuevos : ejecutivos;
  const filtrada = fuente.filter(e => {
    const mb = !busqueda || e.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || e.rut?.includes(busqueda);
    const mc = filtroC === 'TODOS' || e.tipo_contrato === filtroC || (filtroC === 'FREELANCE EMPRESA' && e.tipo_contrato === 'FREELANCE EMPRESA');
    const mk = filtroK === 'TODOS' || e.canal === filtroK;
    return mb && mc && mk;
  }).sort((a, b) => {
    const va = (a[sortCol] || '').toString().toLowerCase();
    const vb = (b[sortCol] || '').toString().toLowerCase();
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const totalPags = Math.max(1, Math.ceil(filtrada.length / POR_PAGINA));
  const pag       = Math.min(pagina, totalPags);
  const slice     = filtrada.slice((pag - 1) * POR_PAGINA, pag * POR_PAGINA);

  const contratados = ejecutivos.filter(e => e.tipo_contrato !== 'FREELANCE').length;
  const freelances  = ejecutivos.filter(e => e.tipo_contrato === 'FREELANCE').length;

  const cols = [
    { key: 'nombre',        label: 'Nombre',     w: '22%' },
    { key: 'rut',           label: 'RUT',        w: '13%' },
    { key: 'cargo',         label: 'Cargo',      w: '20%' },
    { key: 'canal',         label: 'Canal',      w: '11%' },
    { key: 'supervisor',    label: 'Supervisor', w: '13%' },
    { key: 'tipo_contrato', label: 'Contrato',   w: '10%' },
    { key: 'activo',        label: 'Estado',     w: '7%'  },
    { key: '_acc',          label: 'Acciones',   w: '6%'  },
  ];

  const renderAnalisisAgregado = () => {
    const { totales, penalizadas, ventasOk, tasa, datosOrdenados, cargando: statsCargando } = groupStats;

    return (
        <div style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Análisis Acumulado: {filtroC === 'CONTRATADO' ? 'Contratados' : filtroC === 'FREELANCE' ? 'Freelance' : filtroC === 'FREELANCE EMPRESA' ? 'Freelance Empresa' : filtroC}</h2>
            <Link to={`/ejecutivos/GRUPO-${filtroC}`} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#00897B', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 13, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
               📊 Ver Dashboard Completo del Grupo
            </Link>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 20, position: 'relative' }}>
            {statsCargando && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}>
                <div style={{ fontWeight: 600, color: T.teal }}>Cargando métricas reales...</div>
              </div>
            )}
            {/* KPIs */}
            <div style={{ flex: '1 1 400px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div style={{ ...card(), padding: 20, borderLeft: '4px solid ' + T.blue }}>
                    <div style={{ fontSize: 13, color: T.gray600, fontWeight: 700, marginBottom: 4 }}>Total Ventas (Comisionables)</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: T.blue }}>{totales}</div>
                </div>
                <div style={{ ...card(), padding: 20, borderLeft: '4px solid ' + T.red }}>
                    <div style={{ fontSize: 13, color: T.gray600, fontWeight: 700, marginBottom: 4 }}>Penalizadas</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: T.red }}>{penalizadas}</div>
                </div>
                <div style={{ ...card(), padding: 20, borderLeft: '4px solid ' + T.orange }}>
                    <div style={{ fontSize: 13, color: T.gray600, fontWeight: 700, marginBottom: 4 }}>Tasa Penalización</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: T.orange }}>{tasa}%</div>
                </div>
                <div style={{ ...card(), padding: 20, borderLeft: '4px solid ' + T.green }}>
                    <div style={{ fontSize: 13, color: T.gray600, fontWeight: 700, marginBottom: 4 }}>Ventas OK</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: T.green }}>{ventasOk}</div>
                    <div style={{ width: '100%', backgroundColor: T.gray200, height: 4, borderRadius: 2, marginTop: 8 }}>
                        <div style={{ width: `${Math.max(0, 100 - tasa)}%`, backgroundColor: T.green, height: '100%', borderRadius: 2 }} />
                    </div>
                </div>
            </div>
          </div>
          
          {/* Chart */}
          {totales > 0 && (
              <div style={{ ...card(), padding: 20 }}>
                 <h3 style={{ marginTop: 0, fontSize: 16 }}>📈 Rendimiento Mensual Global</h3>
                 <div style={{ height: 300, width: '100%', marginTop: 20 }}>
                   <ResponsiveContainer>
                    <BarChart data={datosOrdenados}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.gray200} />
                      <XAxis dataKey="periodo" stroke={T.gray600} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={T.gray600} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: T.gray100 }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Bar dataKey="ventas" name="Total Ventas" fill={T.blue} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="penalizadas" name="Penalizadas" fill={T.red} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                 </div>
              </div>
          )}
        </div>
    );
  };

  useEffect(() => {
    obtener();
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", color: T.gray800, backgroundColor: T.gray50, padding: '28px 32px', minHeight: '100vh' }}>

      {/* Título */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Ejecutivos de Ventas</h1>
        <p style={{ margin: '4px 0 0', color: T.gray400, fontSize: 14 }}>Gestiona y registra tus ejecutivos de forma masiva</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard icon="👥" value={ejecutivos.length} label="Total Ejecutivos" sub="5% vs. mes anterior" color={T.teal} onClick={() => { setFiltroC('TODOS'); setPagina(1); }} selected={filtroC === 'TODOS'} />
        <StatCard icon="👤" value={contratados}       label="Contratados"     sub="8% vs. mes anterior" color={T.blue} onClick={() => { setFiltroC('CONTRATADO'); setPagina(1); }} selected={filtroC === 'CONTRATADO'} />
        <StatCard icon="💼" value={freelances}        label="Freelance"       sub="0% vs. mes anterior" color={T.orange} onClick={() => { setFiltroC('FREELANCE'); setPagina(1); }} selected={filtroC === 'FREELANCE'} />
        <StatCard icon="🏢" value={ejecutivos.filter(e => e.tipo_contrato === 'FREELANCE EMPRESA').length} label="Freelance Empresa" sub="0% vs. mes anterior" color={T.green} onClick={() => { setFiltroC('FREELANCE EMPRESA'); setPagina(1); }} selected={filtroC === 'FREELANCE EMPRESA'} />
      </div>

      {/* Upload + Filtros en 2 columnas */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Drop zone */}
        <div style={{ ...card(), padding: 20, flex: '1 1 340px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.gray600, marginBottom: 14 }}>
            Subir archivo Cierre (para extraer ejecutivos de Maestro)
          </div>
          <DropZone onFile={handleFile} />
          {archivo && (
            <div style={{ marginTop: 10, fontSize: 12, color: T.teal, fontWeight: 600 }}>
              ✓ {archivo.name}
            </div>
          )}
        </div>

        {/* Filtros */}
        <div style={{ ...card(), padding: 20, flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.gray600 }}>Filtros y acciones</div>

          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.gray400, display: 'flex' }}><IcoSearch /></span>
            <input type="text" placeholder="Buscar por nombre o RUT" value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8, border: `1.5px solid ${T.gray200}`, fontSize: 13, outline: 'none', boxSizing: 'border-box', backgroundColor: T.gray50, color: T.gray800 }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <select value={filtroK} onChange={e => { setFiltroK(e.target.value); setPagina(1); }}
              style={{ flex: 1, padding: '9px 10px', borderRadius: 8, border: `1.5px solid ${T.gray200}`, fontSize: 13, color: T.gray800, outline: 'none', backgroundColor: T.white }}>
              {canalesUnicos.map(c => <option key={c} value={c}>{c === 'TODOS' ? 'Todos los estados' : c}</option>)}
            </select>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10, marginTop: 'auto', flexWrap: 'wrap' }}>
            {datosNuevos.length > 0 && (
              <>
                <button onClick={guardar} style={{ ...btnBase, backgroundColor: T.teal, color: T.white, flex: 1 }}>
                  <IcoSave /> Guardar en BD ({datosNuevos.length})
                </button>
                <button onClick={() => { setDatos([]); setArchivo(null); setTipoSim(null); }}
                  style={{ ...btnBase, backgroundColor: T.gray100, color: T.gray600 }}>
                  <IcoX /> Cancelar carga
                </button>
              </>
            )}
            <button onClick={procesar} disabled={!archivo}
              style={{ ...btnBase, backgroundColor: T.orange, color: T.white, flex: datosNuevos.length ? '0 0 auto' : 1, opacity: archivo ? 1 : 0.5 }}>
              <IcoUpload /> Cargar Cierre
            </button>
          </div>
        </div>
      </div>

      {/* Banner previsualización */}
      {datosNuevos.length > 0 && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', backgroundColor: '#E3F2FD', border: '1px solid #90CAF9', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
          <span style={{ color: T.blue, flexShrink: 0, marginTop: 1, display: 'flex' }}><IcoInfo /></span>
          <div>
            <strong>Previsualización — {datosNuevos.length} registros del simulador {tipoSim}.</strong><br />
            <span style={{ color: T.gray600 }}>
              Contratados: {datosNuevos.filter(e=>e.tipo_contrato==='CONTRATADO').length} | Freelance: {datosNuevos.filter(e=>e.tipo_contrato==='FREELANCE').length} | Supervisores: {datosNuevos.filter(e=>e.es_supervisor).length}. Presiona "Guardar en BD" para confirmar.
            </span>
          </div>
        </div>
      )}

      {/* Analisis Agregado (solo cuando hay filtro seleccionado) */}
      {filtroC !== 'TODOS' && renderAnalisisAgregado()}

      {/* Tabla */}
      <div style={{ ...card(), overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1.5px solid ${T.gray200}` }}>
              {cols.map(col => (
                <th key={col.key}
                  onClick={() => col.key !== '_acc' && toggleSort(col.key)}
                  style={{ padding: '14px 16px', textAlign: 'left', color: T.gray400, fontWeight: 600, fontSize: 12, width: col.w, cursor: col.key === '_acc' ? 'default' : 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {col.key !== '_acc' && <IcoSort active={sortCol === col.key} dir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando && !datosNuevos.length ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.gray400 }}>Cargando datos...</td></tr>
            ) : !slice.length ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.gray400 }}>No hay ejecutivos registrados.</td></tr>
            ) : slice.map((ej, i) => {
              const esSup = ej.es_supervisor || ej.cargo?.toLowerCase().includes('supervisor');
              const esFL  = ej.tipo_contrato === 'FREELANCE';

              return (
                <tr key={ej.id || i}
                  style={{ borderBottom: `1px solid ${T.gray100}`, backgroundColor: i % 2 === 0 ? T.white : T.gray50, transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = T.tealLt}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? T.white : T.gray50}>

                  <td style={{ padding: '13px 16px', fontWeight: 600, color: T.gray800 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {esSup && <span style={{ ...pill('#C8E6C9', '#2E7D32'), fontSize: 9, padding: '2px 6px', borderRadius: 4 }}>SUP</span>}
                      {ej.nombre}
                    </div>
                  </td>

                  <td style={{ padding: '13px 16px', color: T.gray600, fontFamily: 'monospace', fontSize: 12 }}>{ej.rut}</td>

                  <td style={{ padding: '13px 16px', color: T.gray600 }}>{ej.cargo || '-'}</td>

                  <td style={{ padding: '13px 16px' }}><CanalBadge canal={ej.canal} /></td>

                  <td style={{ padding: '13px 16px', color: esSup ? T.gray400 : T.gray600, fontStyle: esSup ? 'italic' : 'normal' }}>
                    {esSup ? '—' : (ej.supervisor || 'Sin Supervisor')}
                  </td>

                  <td style={{ padding: '13px 16px' }}>
                    <span style={pill(esFL ? '#FCE4EC' : '#E3F2FD', esFL ? '#C62828' : '#1565C0')}>
                      {ej.tipo_contrato || 'CONTRATADO'}
                    </span>
                  </td>

                  <td style={{ padding: '13px 16px' }}>
                    <span style={pill(ej.activo !== false ? '#E8F5E9' : '#FFEBEE', ej.activo !== false ? T.green : T.red)}>
                      {ej.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {ej.id ? (
                        <Link to={`/ejecutivos/${ej.id}`}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, backgroundColor: T.gray100, color: T.gray600, textDecoration: 'none' }}
                          title="Ver detalle">
                          <IcoEye />
                        </Link>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, backgroundColor: T.gray100, color: T.gray400 }}>
                          <IcoEye />
                        </span>
                      )}
                      <button 
                        onClick={() => setEditForm({ ...ej })}
                        title="Editar Ejecutivo"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, backgroundColor: T.gray100, color: T.gray600, border: 'none', cursor: 'pointer' }}>
                        <IcoDots />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: `1px solid ${T.gray200}`, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12, color: T.gray400, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <span>👀 Total registros: <strong style={{ color: T.gray800 }}>{filtrada.length}</strong></span>
            <span>Contratados: <strong style={{ color: T.blue }}>{filtrada.filter(e=>e.tipo_contrato!=='FREELANCE' && e.tipo_contrato!=='FREELANCE EMPRESA').length}</strong></span>
            <span>Freelance: <strong style={{ color: T.orange }}>{filtrada.filter(e=>e.tipo_contrato==='FREELANCE').length}</strong></span>
            <span>Freelance Empresa: <strong style={{ color: T.green }}>{filtrada.filter(e=>e.tipo_contrato==='FREELANCE EMPRESA').length}</strong></span>
            <span>Supervisores: <strong style={{ color: T.purple }}>{filtrada.filter(e=>e.es_supervisor||e.cargo?.toLowerCase().includes('supervisor')).length}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setPagina(p => Math.max(1,p-1))} disabled={pag===1}
              style={{ ...btnBase, padding: '6px 10px', backgroundColor: T.gray100, color: T.gray600, opacity: pag===1?0.4:1 }}>
              <IcoChevL />
            </button>
            {(() => {
              const maxVisible = 5;
              let start = Math.max(1, pag - Math.floor(maxVisible / 2));
              let end = start + maxVisible - 1;
              if (end > totalPags) {
                end = totalPags;
                start = Math.max(1, end - maxVisible + 1);
              }
              const pages = [];
              for (let i = start; i <= end; i++) pages.push(i);
              
              return pages.map(p => (
                <button key={p} onClick={() => setPagina(p)}
                  style={{ ...btnBase, padding: '6px 11px', minWidth: 34, backgroundColor: pag===p ? T.teal : T.gray100, color: pag===p ? T.white : T.gray600 }}>
                  {p}
                </button>
              ));
            })()}
            <button onClick={() => setPagina(p => Math.min(totalPags,p+1))} disabled={pag===totalPags}
              style={{ ...btnBase, padding: '6px 10px', backgroundColor: T.gray100, color: T.gray600, opacity: pag===totalPags?0.4:1 }}>
              <IcoChevR />
            </button>
          </div>
        </div>
      </div>
      
      {/* MODAL DE EDICIÓN */}
      {editForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1E293B' }}>Editar Ejecutivo</h3>
              <button onClick={() => setEditForm(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
                <IcoX />
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Nombre Completo</label>
                <input 
                  type="text" 
                  value={editForm.nombre || ''} 
                  onChange={e => setEditForm({ ...editForm, nombre: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>RUT</label>
                  <input 
                    type="text" 
                    value={editForm.rut || ''} 
                    onChange={e => setEditForm({ ...editForm, rut: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Cargo</label>
                  <input 
                    type="text" 
                    value={editForm.cargo || ''} 
                    onChange={e => setEditForm({ ...editForm, cargo: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Canal</label>
                  <select 
                    value={editForm.canal || ''} 
                    onChange={e => setEditForm({ ...editForm, canal: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: 'white' }}
                  >
                    <option value="">Sin Canal</option>
                    <option value="Masivo Fijo">Masivo Fijo</option>
                    <option value="Pyme Móvil">Pyme Móvil</option>
                    <option value="Masivo Móvil">Masivo Móvil</option>
                    <option value="Pyme Fijo">Pyme Fijo</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Tipo de Contrato</label>
                  <select 
                    value={editForm.tipo_contrato || ''} 
                    onChange={e => setEditForm({ ...editForm, tipo_contrato: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: 'white' }}
                  >
                    <option value="CONTRATADO">Contratado</option>
                    <option value="FREELANCE">Freelance</option>
                    <option value="FREELANCE EMPRESA">Freelance Empresa</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Supervisor</label>
                <input 
                  type="text" 
                  value={editForm.supervisor || ''} 
                  onChange={e => setEditForm({ ...editForm, supervisor: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                  <input 
                    type="checkbox" 
                    checked={editForm.activo !== false}
                    onChange={e => setEditForm({ ...editForm, activo: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  Usuario Activo
                </label>
              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setEditForm(null)}
                style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleGuardarEdit}
                disabled={guardandoEdit}
                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#00897B', color: 'white', fontWeight: 600, cursor: guardandoEdit ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {guardandoEdit ? 'Guardando...' : '💾 Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Ejecutivos;
