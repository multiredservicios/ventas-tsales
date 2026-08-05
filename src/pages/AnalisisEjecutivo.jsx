import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { supabase } from '../supabaseClient';
import {
  sincronizarAsistenciaEjecutivo,
  obtenerAsistenciaGuardada,
  normalizarRut
} from '../services/bnovusService';

const CustomMetaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const cumplio = data.ventas >= 21;
    const diff = data.ventas - 21;
    const pct = ((data.ventas / 21) * 100).toFixed(1);
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#0f172a' }}>Período: {label}</p>
        <p style={{ margin: '3px 0', color: '#1e88e5', fontSize: '12px' }}><strong>Ventas del mes:</strong> {data.ventas}</p>
        <p style={{ margin: '3px 0', color: '#dc2626', fontSize: '12px' }}><strong>Meta objetivo:</strong> 21 ventas</p>
        <p style={{ margin: '3px 0', color: diff >= 0 ? '#16a34a' : '#dc2626', fontSize: '12px' }}>
          <strong>Diferencia:</strong> {diff >= 0 ? `+${diff}` : diff}
        </p>
        <p style={{ margin: '3px 0', color: '#475569', fontSize: '12px' }}><strong>Cumplimiento:</strong> {pct}%</p>
        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 'bold', fontSize: '11px', color: cumplio ? '#16a34a' : '#dc2626' }}>
            {cumplio ? '✅ Meta Cumplida' : '❌ No Cumplida'}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

function AnalisisEjecutivo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ejecutivo, setEjecutivo] = useState(null);
  const [supervisor, setSupervisor] = useState(null); // datos del supervisor

  const [datosGrafico, setDatosGrafico] = useState([]);
  const [kpis, setKpis] = useState({ totales: 0, penalizadas: 0, tasa: 0 });
  const [listaVentas, setListaVentas] = useState([]);
  const [listaPenalizaciones, setListaPenalizaciones] = useState([]);
  
  // Estado para Asistencia de Bnovus
  const [listaAsistencia, setListaAsistencia] = useState([]);
  
  // Filtros Historia Ventas
  const [fHistEstado, setFHistEstado] = useState('');
  const [fHistMes, setFHistMes] = useState('');
  const [fHistProducto, setFHistProducto] = useState('');
  const [fHistTipo, setFHistTipo] = useState('');
  const [fHistCliente, setFHistCliente] = useState('');
  const [fHistFecha, setFHistFecha] = useState('');
  const [sincronizandoBnovus, setSincronizandoBnovus] = useState(false);
  const [mensajeBnovus, setMensajeBnovus] = useState('');

  // Estados para editar RUT
  const [editandoRut, setEditandoRut] = useState(false);
  const [nuevoRut, setNuevoRut] = useState('');

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerDatosYVentas();
  }, [id]);

  const obtenerDatosYVentas = async () => {
    setCargando(true);

    // 1. Traer datos del ejecutivo
    const { data: dataEjecutivo } = await supabase
      .from('ejecutivos')
      .select('*')
      .eq('id', id)
      .single();

    let penList = [];
    if (dataEjecutivo) {
      setEjecutivo(dataEjecutivo);

      // Buscar supervisor
      if (dataEjecutivo.supervisor && dataEjecutivo.supervisor !== 'Sin Supervisor') {
        const { data: dataSup } = await supabase
          .from('ejecutivos')
          .select('id, nombre, rut, correo, canal')
          .ilike('nombre', dataEjecutivo.supervisor)
          .maybeSingle();
        if (dataSup) setSupervisor(dataSup);
      }

      // 2. Traer Penalizaciones masivas
      const { data: dataPenalizaciones } = await supabase
        .from('penalizaciones')
        .select('*')
        .or(`ejecutivo_id.eq.${id},nombre_ejecutivo.ilike.${dataEjecutivo.nombre.trim()}`)
        .order('id', { ascending: false });

      if (dataPenalizaciones) {
        penList = dataPenalizaciones;
        setListaPenalizaciones(dataPenalizaciones);
      }

      // 3. Traer Asistencia Bnovus desde Supabase
      const dataAsist = await obtenerAsistenciaGuardada(id, dataEjecutivo.rut);
      setListaAsistencia(dataAsist || []);
    }

    // 4. Traer TODAS las ventas de este ejecutivo
    const { data: dataVentas } = await supabase
      .from('ventas')
      .select('*')
      .eq('ejecutivo_id', id)
      .order('fecha_ingreso', { ascending: false });

    const ventasBase = dataVentas || [];

    // Mapas para cruce de penalizaciones por N° de Orden y RUT (para obtener el periodo)
    const penalizedOrdersMap = new Map();
    const penalizedRutsMap = new Map();
    penList.forEach(p => {
      const o = String(p.orden || '').trim();
      if (o) penalizedOrdersMap.set(o, p.periodo);
      const r = String(p.rut_cliente || '').trim();
      if (r) penalizedRutsMap.set(r, p.periodo);
    });

    const ventasProcesadas = ventasBase.map(v => {
      const numOrden = String(v.numero_orden || '').trim();
      const rut = String(v.rut_cliente || '').trim();
      
      const periodoPenalizacion = penalizedOrdersMap.get(numOrden) || penalizedRutsMap.get(rut) || null;
      const esPenalizadaPorArchivo = !!periodoPenalizacion;
      
      const estadoUpper = (v.estado || '').toUpperCase();
      const esPenalizada = esPenalizadaPorArchivo || estadoUpper === 'PENALIZADA' || estadoUpper === 'CAIDA' || estadoUpper === 'RECHAZADA';
      
      return {
        ...v,
        esPenalizada,
        estado: esPenalizada ? 'PENALIZADA' : v.estado,
        mesPenalizacion: periodoPenalizacion
      };
    });

    setListaVentas(ventasProcesadas);
    procesarEstadisticas(ventasProcesadas);

    setCargando(false);
  };

  const handleSincronizarBnovus = async () => {
    if (!ejecutivo) {
      return alert('No hay ejecutivo seleccionado para sincronizar.');
    }

    setSincronizandoBnovus(true);
    setMensajeBnovus('Consultando API Bnovus por RUT y Nombre...');

    try {
      const res = await sincronizarAsistenciaEjecutivo(id, ejecutivo.rut, ejecutivo.nombre);
      const dataActualizada = await obtenerAsistenciaGuardada(id, ejecutivo.rut);
      setListaAsistencia(dataActualizada);
      setMensajeBnovus(`✅ Sincronización exitosa: ${res.length} días actualizados desde Bnovus.`);
      alert(`✅ Sincronización Bnovus exitosa: ${res.length} registros cargados.`);
    } catch (err) {
      console.error(err);
      setMensajeBnovus('⚠️ No se pudo conectar directamente con Bnovus API. Se muestran los datos locales guardados.');
      alert('Aviso Bnovus: ' + err.message);
    } finally {
      setSincronizandoBnovus(false);
    }
  };

  const handleGuardarRut = async () => {
    if (!nuevoRut.trim()) return alert('El RUT no puede estar vacío.');
    try {
      const { error } = await supabase
        .from('ejecutivos')
        .update({ rut: nuevoRut.trim() })
        .eq('id', id);

      if (error) throw error;
      
      setEjecutivo({ ...ejecutivo, rut: nuevoRut.trim() });
      setEditandoRut(false);
      alert('RUT actualizado correctamente.');
    } catch (err) {
      alert('Error al actualizar RUT: ' + err.message);
    }
  };

  const procesarEstadisticas = (ventas) => {
    const totales = ventas.length;
    const penalizadas = ventas.filter(v => v.esPenalizada).length;
    const tasa = totales > 0 ? Math.round((penalizadas / totales) * 100) : 0;

    setKpis({ totales, penalizadas, tasa });

    const agrupadoPorMes = {};
    ventas.forEach((venta) => {
      const mes = venta.fecha_ingreso ? venta.fecha_ingreso.substring(0, 7) : 'Sin fecha';
      if (!agrupadoPorMes[mes]) {
        agrupadoPorMes[mes] = { periodo: mes, ventas: 0, penalizadas: 0 };
      }
      agrupadoPorMes[mes].ventas += 1;
      if (venta.esPenalizada) {
        agrupadoPorMes[mes].penalizadas += 1;
      }
    });

    const datosOrdenados = Object.values(agrupadoPorMes).sort((a, b) =>
      a.periodo.localeCompare(b.periodo)
    );
    setDatosGrafico(datosOrdenados);
  };

  const calcularVentana = (tipo, meses) => {
    const ventasDelTipo = listaVentas.filter(v =>
      (v.tipo_servicio || '').toLowerCase() === tipo.toLowerCase()
    );
    const periodos = new Set();
    ventasDelTipo.forEach(v => {
      const p = (v.fecha_ingreso || '').substring(0, 7);
      if (p) periodos.add(p);
    });
    const periodosOrdenados = [...periodos].sort().slice(-meses);
    return periodosOrdenados.map(periodo => {
      const del_periodo = ventasDelTipo.filter(v => (v.fecha_ingreso || '').startsWith(periodo));
      const cantidad    = del_periodo.length;
      const penalizadas = del_periodo.filter(v => v.esPenalizada).length;
      const pct = cantidad > 0 ? ((penalizadas / cantidad) * 100).toFixed(1) + '%' : '0.0%';
      return { periodo, cantidad, penalizadas, pct };
    });
  };

  const TablaPenalizaciones = ({ titulo, datos, sinDatos, ventana }) => (
    <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', background: '#FAFAFA' }}>
      <div style={{ padding: '10px 16px', background: '#fff', borderBottom: '1px solid #E2E8F0', fontWeight: 700, fontSize: 13, color: '#0F172A' }}>
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
              {['Periodo', 'Cantidad', 'Penalizadas', '% Penalizadas'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Periodo' ? 'left' : 'center', color: '#475569', fontWeight: 700, fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((row, i) => {
              const tasaNum = parseFloat(row.pct);
              const color   = tasaNum >= 20 ? '#DC2626' : tasaNum >= 10 ? '#D97706' : '#16A34A';
              return (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '9px 12px', color: '#334155', fontWeight: 600 }}>{row.periodo}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', color: '#334155' }}>{row.cantidad}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', color: row.penalizadas > 0 ? '#DC2626' : '#334155', fontWeight: row.penalizadas > 0 ? 700 : 400 }}>{row.penalizadas}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <span style={{ background: tasaNum >= 20 ? '#FEE2E2' : tasaNum >= 10 ? '#FEF3C7' : '#DCFCE7', color, borderRadius: 20, padding: '2px 8px', fontWeight: 700, fontSize: 11 }}>
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

  const hayFijo  = listaVentas.some(v => (v.tipo_servicio || '').toLowerCase() === 'fijo');
  const hayMovil = listaVentas.some(v => (v.tipo_servicio || '').toLowerCase() !== 'fijo');

  const estadoColor = (estado) => {
    if (!estado) return {};
    const e = estado.toUpperCase();
    if (e === 'CAIDA' || e === 'RECHAZADA' || e === 'PENALIZADA')
      return { backgroundColor: '#FFEBEE', color: '#C62828', borderRadius: '10px', padding: '3px 8px', fontSize: '11px', fontWeight: 'bold' };
    if (e === 'ACTIVA' || e === 'APROBADA' || e === 'VIGENTE')
      return { backgroundColor: '#E8F5E9', color: '#2E7D32', borderRadius: '10px', padding: '3px 8px', fontSize: '11px', fontWeight: 'bold' };
    return { backgroundColor: '#FFF8E1', color: '#F57F17', borderRadius: '10px', padding: '3px 8px', fontSize: '11px', fontWeight: 'bold' };
  };

  if (cargando) return <h2 style={{ padding: '20px' }}>Cargando perfil y ventas...</h2>;
  if (!ejecutivo) return <h2 style={{ padding: '20px' }}>Ejecutivo no encontrado.</h2>;

  const esFreelance = ejecutivo.tipo_contrato === 'FREELANCE';

  // Métricas de Meta (21 ventas)
  const totalMeses = datosGrafico.length;
  const mesesCumplidos = datosGrafico.filter(m => m.ventas >= 21).length;

  // Métricas de Asistencia Bnovus
  const diasAsistidos = listaAsistencia.filter(a => a.presente && !a.es_licencia && !a.es_vacaciones).length;
  const diasLicencia  = listaAsistencia.filter(a => a.es_licencia).length;
  const diasAusente   = listaAsistencia.filter(a => a.ausente && !a.es_licencia && !a.es_vacaciones).length;
  const diasVacaciones = listaAsistencia.filter(a => a.es_vacaciones || a.es_permiso).length;

  // Agrupar asistencia por mes
  const asistenciaPorMes = {};
  listaAsistencia.forEach(a => {
    if (!a.periodo) return;
    if (!asistenciaPorMes[a.periodo]) {
      asistenciaPorMes[a.periodo] = { periodo: a.periodo, asistidos: 0, licencias: 0, ausencias: 0, vacaciones: 0 };
    }
    if (a.es_licencia) asistenciaPorMes[a.periodo].licencias++;
    else if (a.es_vacaciones || a.es_permiso) asistenciaPorMes[a.periodo].vacaciones++;
    else if (a.ausente) asistenciaPorMes[a.periodo].ausencias++;
    else if (a.presente) asistenciaPorMes[a.periodo].asistidos++;
  });
  const asistenciaMensualArr = Object.values(asistenciaPorMes).sort((a, b) => b.periodo.localeCompare(a.periodo));

  // Texto Explicativo de Contexto de Meta vs Asistencia para el último período registrado
  const ultimoMesObj = datosGrafico.length > 0 ? datosGrafico[datosGrafico.length - 1] : null;
  let bannerJustificacion = null;
  if (ultimoMesObj) {
    const mesStr = ultimoMesObj.periodo;
    const asistenciasMes = listaAsistencia.filter(a => a.periodo === mesStr);
    const licMes = asistenciasMes.filter(a => a.es_licencia).length;
    const ausMes = asistenciasMes.filter(a => a.ausente && !a.es_licencia && !a.es_vacaciones).length;
    const vacMes = asistenciasMes.filter(a => a.es_vacaciones).length;

    if (ultimoMesObj.ventas < 21) {
      if (licMes > 0) {
        bannerJustificacion = {
          tipo: 'licencia',
          texto: `⚠️ El ejecutivo registró ${ultimoMesObj.ventas} ventas en el período ${mesStr} (Meta: 21). Justificado por ${licMes} día(s) de Licencia Médica en Bnovus.`
        };
      } else if (ausMes > 1) {
        bannerJustificacion = {
          tipo: 'ausencia',
          texto: `🚨 El ejecutivo realizó ${ultimoMesObj.ventas} ventas en el período ${mesStr} (Meta: 21). Registra ${ausMes} Inasistencia(s) / Falta(s) no justificadas en Bnovus.`
        };
      } else if (vacMes > 0) {
        bannerJustificacion = {
          tipo: 'vacaciones',
          texto: `🏖️ El ejecutivo realizó ${ultimoMesObj.ventas} ventas en el período ${mesStr} (Meta: 21). Tuvo ${vacMes} día(s) de Vacaciones/Permiso autorizados en Bnovus.`
        };
      } else {
        bannerJustificacion = {
          tipo: 'normal',
          texto: `📉 El ejecutivo realizó ${ultimoMesObj.ventas} ventas en el período ${mesStr} (Meta: 21). Asistencia regular pero por debajo de la meta.`
        };
      }
    } else {
      bannerJustificacion = {
        tipo: 'cumplida',
        texto: `✅ El ejecutivo superó la meta con ${ultimoMesObj.ventas} ventas en el período ${mesStr} (Meta: 21). Excelente asistencia.`
      };
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>📋 Análisis de Ejecutivo</h2>
        <button
          onClick={() => navigate('/ejecutivos')}
          style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
        >
          ⬅ Volver a la lista
        </button>
      </div>

      {/* FILA 1: Resumen + KPIs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>

        {/* Tarjeta Resumen */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>📝 Datos del Ejecutivo</h3>

          <p style={{ margin: '8px 0' }}><strong>NOMBRE:</strong> {ejecutivo.nombre}</p>
          <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong>RUT:</strong> 
            {editandoRut ? (
              <div style={{ display: 'flex', gap: '5px' }}>
                <input 
                  type="text" 
                  value={nuevoRut} 
                  onChange={e => setNuevoRut(e.target.value)} 
                  placeholder="Ej: 19123456-7"
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <button onClick={handleGuardarRut} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>Guardar</button>
                <button onClick={() => setEditandoRut(false)} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>X</button>
              </div>
            ) : (
              <>
                {ejecutivo.rut || <span style={{ color: '#dc2626', fontStyle: 'italic' }}>Sin RUT</span>}
                <button 
                  onClick={() => { setNuevoRut(ejecutivo.rut || ''); setEditandoRut(true); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '14px', padding: 0 }}
                  title="Editar RUT"
                >
                  ✏️
                </button>
              </>
            )}
          </div>
          <p style={{ margin: '8px 0' }}><strong>CORREO:</strong> {ejecutivo.correo || 'No registrado'}</p>
          <p style={{ margin: '8px 0' }}>
            <strong>CANAL:</strong>{' '}
            <span style={{
              backgroundColor: ejecutivo.canal?.toLowerCase().includes('masivo') ? '#FFF3E0' : '#E8F5E9',
              color: ejecutivo.canal?.toLowerCase().includes('masivo') ? '#E65100' : '#2E7D32',
              padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold'
            }}>
              {ejecutivo.canal || 'Sin Canal'}
            </span>
          </p>
          <p style={{ margin: '8px 0' }}>
            <strong>CONTRATO:</strong>{' '}
            <span style={{
              backgroundColor: esFreelance ? '#FCE4EC' : '#E3F2FD',
              color: esFreelance ? '#C62828' : '#1565C0',
              padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold'
            }}>
              {ejecutivo.tipo_contrato || 'CONTRATADO'}
            </span>
          </p>
          <p style={{ margin: '8px 0' }}><strong>ESTADO:</strong> {ejecutivo.activo ? '✅ Activo' : '❌ Inactivo'}</p>

          {/* SUPERVISOR - sección destacada */}
          <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Supervisor directo</p>
            {ejecutivo.supervisor && ejecutivo.supervisor !== 'Sin Supervisor' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: '#009688', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '14px', flexShrink: 0
                }}>
                  {ejecutivo.supervisor.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{ejecutivo.supervisor}</div>
                  {supervisor && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {supervisor.correo || 'Sin correo'} · Canal: {supervisor.canal || '-'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <span style={{ color: '#aaa', fontSize: '13px', fontStyle: 'italic' }}>Sin supervisor registrado</span>
            )}
          </div>
        </div>

        {/* KPIs GLOBALES */}
        <div style={{ flex: 2, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>📊 KPIs Globales</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: '20px' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Total Ventas</p>
              <h2 style={{ fontSize: '40px', margin: '0', color: '#1976D2' }}>{kpis.totales}</h2>
            </div>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Penalizadas</p>
              <h2 style={{ fontSize: '40px', margin: '0', color: '#f44336' }}>{kpis.penalizadas}</h2>
            </div>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Tasa Penalización</p>
              <h2 style={{ fontSize: '40px', margin: '0', color: kpis.tasa > 20 ? '#f44336' : '#4CAF50' }}>
                {kpis.tasa}%
              </h2>
            </div>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Ventas OK</p>
              <h2 style={{ fontSize: '40px', margin: '0', color: '#4CAF50' }}>{kpis.totales - kpis.penalizadas}</h2>
            </div>
          </div>

          {/* Barra visual de tasa */}
          {kpis.totales > 0 && (
            <div style={{ marginTop: '30px', padding: '0 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                <span>Ventas OK ({kpis.totales - kpis.penalizadas})</span>
                <span>Penalizadas ({kpis.penalizadas})</span>
              </div>
              <div style={{ height: '12px', backgroundColor: '#e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${100 - kpis.tasa}%`,
                  backgroundColor: '#4CAF50',
                  borderRadius: '6px 0 0 6px',
                  display: 'inline-block'
                }} />
                <div style={{
                  height: '100%',
                  width: `${kpis.tasa}%`,
                  backgroundColor: '#f44336',
                  display: 'inline-block'
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN INTEGRADORA BNOVUS: ASISTENCIA Y LICENCIAS MÉDICAS */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏥</span> Asistencia & Licencias Médicas (API Bnovus)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Justificación de metas según la presencia, licencias médicas e inasistencias en Bnovus.
            </p>
          </div>

          <button
            onClick={handleSincronizarBnovus}
            disabled={sincronizandoBnovus}
            style={{
              backgroundColor: '#00897B', color: 'white', border: 'none',
              padding: '9px 16px', borderRadius: '8px', fontWeight: 600,
              fontSize: '13px', cursor: sincronizandoBnovus ? 'wait' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}
          >
            🔄 {sincronizandoBnovus ? 'Sincronizando Bnovus...' : 'Sincronizar Asistencia Bnovus'}
          </button>
        </div>

        {mensajeBnovus && (
          <div style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#334155', marginBottom: '14px' }}>
            {mensajeBnovus}
          </div>
        )}

        {/* Tarjetas de Métricas de Asistencia Bnovus */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', backgroundColor: '#F8FAFC' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>📅 Días Asistidos</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#16A34A', marginTop: '2px' }}>{diasAsistidos}</div>
            <span style={{ fontSize: '10px', color: '#94A3B8' }}>Presente en turno</span>
          </div>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', backgroundColor: '#F8FAFC' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>🏥 Licencias Médicas</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>{diasLicencia}</div>
            <span style={{ fontSize: '10px', color: '#94A3B8' }}>Días justificables</span>
          </div>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', backgroundColor: '#F8FAFC' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>🚫 Inasistencias / Faltas</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#DC2626', marginTop: '2px' }}>{diasAusente}</div>
            <span style={{ fontSize: '10px', color: '#94A3B8' }}>Faltas no justificadas</span>
          </div>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', backgroundColor: '#F8FAFC' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>🏖️ Vacaciones / Permisos</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563EB', marginTop: '2px' }}>{diasVacaciones}</div>
            <span style={{ fontSize: '10px', color: '#94A3B8' }}>Autorizados</span>
          </div>
        </div>

        {/* Banner de Justificación Meta vs Asistencia */}
        {bannerJustificacion && (
          <div style={{
            padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold',
            backgroundColor: bannerJustificacion.tipo === 'cumplida' ? '#DCFCE7' : bannerJustificacion.tipo === 'licencia' ? '#FEF3C7' : '#FEE2E2',
            color: bannerJustificacion.tipo === 'cumplida' ? '#16A34A' : bannerJustificacion.tipo === 'licencia' ? '#92400E' : '#991B1B',
            border: `1px solid ${bannerJustificacion.tipo === 'cumplida' ? '#86EFAC' : bannerJustificacion.tipo === 'licencia' ? '#FDE68A' : '#FCA5A5'}`,
            marginBottom: '16px'
          }}>
            {bannerJustificacion.texto}
          </div>
        )}

        {/* Resumen Mensual de Asistencias, Faltas y Licencias */}
        {asistenciaMensualArr.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1E293B', fontSize: '14px' }}>📊 Resumen Mensual de Inasistencias y Licencias</h4>
            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
                <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <tr>
                    <th style={{ padding: '10px 14px', color: '#475569', textAlign: 'left' }}>Mes / Período</th>
                    <th style={{ padding: '10px 14px', color: '#16A34A' }}>Días Asistidos</th>
                    <th style={{ padding: '10px 14px', color: '#D97706' }}>Licencias Médicas</th>
                    <th style={{ padding: '10px 14px', color: '#DC2626' }}>Inasistencias (Faltas)</th>
                    <th style={{ padding: '10px 14px', color: '#2563EB' }}>Vacaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {asistenciaMensualArr.map((mes, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#334155', textAlign: 'left' }}>{mes.periodo}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: mes.asistidos > 0 ? '#16A34A' : '#94A3B8' }}>{mes.asistidos}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: mes.licencias > 0 ? '#D97706' : '#94A3B8' }}>
                        {mes.licencias > 0 ? `${mes.licencias} día(s)` : '0'}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: mes.ausencias > 0 ? '#DC2626' : '#94A3B8' }}>
                        {mes.ausencias > 0 ? `${mes.ausencias} falta(s)` : '0'}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: mes.vacaciones > 0 ? '#2563EB' : '#94A3B8' }}>{mes.vacaciones}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabla Detallada de Asistencia Registrada */}
        {listaAsistencia.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F1F5F9' }}>
                  <th style={{ padding: '8px 12px', color: '#475569' }}>Fecha</th>
                  <th style={{ padding: '8px 12px', color: '#475569' }}>Período</th>
                  <th style={{ padding: '8px 12px', color: '#475569' }}>Estado Bnovus</th>
                  <th style={{ padding: '8px 12px', color: '#475569', textAlign: 'center' }}>Horas Trabajadas</th>
                  <th style={{ padding: '8px 12px', color: '#475569', textAlign: 'center' }}>Atraso Entrada</th>
                </tr>
              </thead>
              <tbody>
                {listaAsistencia.slice(0, 10).map((a, i) => {
                  let badgeBg = '#DCFCE7', badgeColor = '#16A34A', textEstado = '✅ Presente';
                  if (a.es_licencia) { badgeBg = '#FEF3C7'; badgeColor = '#92400E'; textEstado = '🏥 Licencia Médica'; }
                  else if (a.es_vacaciones) { badgeBg = '#DBEAFE'; badgeColor = '#1E40AF'; textEstado = '🏖️ Vacaciones'; }
                  else if (a.es_permiso) { badgeBg = '#F3E8FF'; badgeColor = '#6B21A8'; textEstado = `📋 ${a.nombre_permiso || 'Permiso'}`; }
                  else if (a.ausente) { badgeBg = '#FEE2E2'; badgeColor = '#991B1B'; textEstado = '🚫 Ausente'; }

                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{a.fecha}</td>
                      <td style={{ padding: '8px 12px', color: '#64748B' }}>{a.periodo}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ backgroundColor: badgeBg, color: badgeColor, padding: '2px 8px', borderRadius: '10px', fontWeight: 700, fontSize: '11px' }}>
                          {textEstado}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600 }}>{a.horas_trabajadas || 0} hrs</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: a.horas_atraso > 0 ? '#DC2626' : '#64748B', fontWeight: a.horas_atraso > 0 ? 700 : 400 }}>
                        {a.horas_atraso > 0 ? `${a.horas_atraso} hrs` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GRÁFICO Y ANÁLISIS DE META (META: 21 VENTAS POR MES) */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎯</span> Evaluación de Meta Mensual (Meta Objetivo: 21 Ventas)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Compara las ventas registradas de cada mes contra el objetivo de 21 ventas.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '5px 12px', borderRadius: '20px', backgroundColor: '#E0F2F1', color: '#00695C' }}>
              🎯 Meta Exigida: 21 Ventas/Mes
            </span>
            <span style={{
              fontSize: '12px', fontWeight: 'bold', padding: '5px 12px', borderRadius: '20px',
              backgroundColor: mesesCumplidos === totalMeses && totalMeses > 0 ? '#DCFCE7' : '#FEF3C7',
              color: mesesCumplidos === totalMeses && totalMeses > 0 ? '#16A34A' : '#D97706'
            }}>
              {mesesCumplidos} de {totalMeses} meses con meta cumplida
            </span>
          </div>
        </div>

        {datosGrafico.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>
            Este ejecutivo aún no tiene ventas registradas para evaluar la meta.
          </p>
        ) : (
          <>
            <div style={{ height: '320px', marginBottom: '24px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafico} margin={{ top: 25, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="periodo" />
                  <YAxis domain={[0, maxVal => Math.max(maxVal + 5, 25)]} />
                  <Tooltip content={<CustomMetaTooltip />} />
                  <Legend />
                  <ReferenceLine
                    y={21}
                    stroke="#DC2626"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ value: '🎯 META: 21 VENTAS', fill: '#DC2626', fontWeight: 'bold', position: 'top' }}
                  />
                  <Bar dataKey="ventas" name="Ventas del Mes">
                    {datosGrafico.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.ventas >= 21 ? '#16A34A' : entry.ventas >= 15 ? '#F59E0B' : '#DC2626'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* TABLA DE RESUMEN DE CUMPLIMIENTO DE META */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <tr>
                    <th style={{ padding: '10px 14px', color: '#475569' }}>Período / Mes</th>
                    <th style={{ padding: '10px 14px', color: '#475569', textAlign: 'center' }}>Ventas Realizadas</th>
                    <th style={{ padding: '10px 14px', color: '#475569', textAlign: 'center' }}>Meta Objetivo</th>
                    <th style={{ padding: '10px 14px', color: '#475569', textAlign: 'center' }}>Diferencia vs Meta</th>
                    <th style={{ padding: '10px 14px', color: '#475569', textAlign: 'center' }}>% Cumplimiento</th>
                    <th style={{ padding: '10px 14px', color: '#475569', textAlign: 'center' }}>Estado de Meta</th>
                  </tr>
                </thead>
                <tbody>
                  {datosGrafico.map((m, idx) => {
                    const diff = m.ventas - 21;
                    const cumplio = m.ventas >= 21;
                    const pct = ((m.ventas / 21) * 100).toFixed(1);

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#334155' }}>{m.periodo}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>{m.ventas}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748B' }}>21</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: diff >= 0 ? '#16A34A' : '#DC2626' }}>
                          {diff >= 0 ? `+${diff}` : diff}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: cumplio ? '#16A34A' : parseFloat(pct) >= 70 ? '#D97706' : '#DC2626' }}>
                          {pct}%
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: cumplio ? '#DCFCE7' : '#FEE2E2',
                            color: cumplio ? '#16A34A' : '#DC2626',
                            padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold'
                          }}>
                            {cumplio ? '✅ META CUMPLIDA' : '❌ NO CUMPLIDA'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* TABLAS DE PENALIZACIONES POR VENTANA DE TIEMPO (AGRUPADAS POR MES DE ORIGEN DE VENTA) */}
      {listaVentas.length > 0 && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '4px' }}>📌 Penalizaciones por Ventana de Tiempo</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748B' }}>
            Calculado según el <strong>mes de origen de la venta</strong> cruzado con el archivo de penalizaciones.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <TablaPenalizaciones titulo="📌 Penalizaciones Fijo 3M"  datos={calcularVentana('fijo', 3)}  sinDatos={!hayFijo}  ventana="N3" />
            <TablaPenalizaciones titulo="📌 Penalizaciones Móvil 3M" datos={calcularVentana('movil', 3)} sinDatos={!hayMovil} ventana="N3" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <TablaPenalizaciones titulo="📌 Penalizaciones Fijo 6M"  datos={calcularVentana('fijo', 6)}  sinDatos={!hayFijo}  ventana="N6" />
            <TablaPenalizaciones titulo="📌 Penalizaciones Móvil 6M" datos={calcularVentana('movil', 6)} sinDatos={!hayMovil} ventana="N6" />
          </div>
        </div>
      )}

      {/* GRÁFICO DE MES DE ORIGEN DE VENTA (VENTAS Y PENALIZADAS) */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '20px', marginTop: 0 }}>📈 Ventas totales (azul) con tramo penalizado (rojo) por mes de venta</h3>

        {datosGrafico.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>
            Este ejecutivo aún no tiene ventas registradas.
          </p>
        ) : (
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ventas" stackId="a" fill="#2196F3" name="Ventas totales" />
                <Bar dataKey="penalizadas" stackId="a" fill="#f44336" name="Penalizadas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* SECCIÓN DETALLE REGISTRO DE PENALIZACIONES IMPORTADAS */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚨</span> Penalizaciones Registradas (Archivo Penalizaciones)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              Lista de registros importados desde el archivo de penalizaciones.
            </p>
          </div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '4px 12px', borderRadius: '20px' }}>
              {listaPenalizaciones.length} Registros Importados
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
              <tr>
                <th style={{ padding: '12px', color: '#555' }}>Hoja / Tipo</th>
                <th style={{ padding: '12px', color: '#555' }}>Orden / Celular</th>
                <th style={{ padding: '12px', color: '#555' }}>Cliente (RUT)</th>
                <th style={{ padding: '12px', color: '#555' }}>Producto / Motivo</th>
                <th style={{ padding: '12px', color: '#555' }}>Periodo Carga</th>
              </tr>
            </thead>
            <tbody>
              {listaPenalizaciones.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                    ✅ Este ejecutivo no registra penalizaciones cargadas en el sistema.
                  </td>
                </tr>
              ) : (
                listaPenalizaciones.map((pen, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                        Penalizaciones
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {pen.orden || '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#475569' }}>
                      {pen.rut_cliente || '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#334155' }}>
                      {pen.motivo_baja || pen.producto || pen.tipo_transaccion || '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#64748B', fontWeight: 600 }}>
                      {pen.periodo || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLA DE HISTORIA DE VENTAS */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>📄 Historia de ventas</h3>
          <span style={{ fontSize: '13px', color: '#888' }}>{listaVentas.length} registros en total</span>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <select value={fHistEstado} onChange={e => setFHistEstado(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}>
            <option value="">Estado: Todos</option>
            <option value="ACTIVA">Solo Activas</option>
            <option value="PENALIZADA">Solo Penalizadas / Caídas</option>
          </select>
          <input type="month" value={fHistMes} onChange={e => setFHistMes(e.target.value)} placeholder="Mes Origen" style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }} title="Filtrar por Mes de Origen" />
          <input type="text" value={fHistProducto} onChange={e => setFHistProducto(e.target.value)} placeholder="Buscar Producto..." style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }} />
          <select value={fHistTipo} onChange={e => setFHistTipo(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }}>
            <option value="">Tipo: Todos</option>
            <option value="FIJO">FIJO</option>
            <option value="MOVIL">MÓVIL</option>
          </select>
          <input type="text" value={fHistCliente} onChange={e => setFHistCliente(e.target.value)} placeholder="RUT Cliente..." style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', width: '120px' }} />
          <input type="date" value={fHistFecha} onChange={e => setFHistFecha(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px' }} title="Filtrar por Fecha Exacta" />
          
          <button 
            onClick={() => { setFHistEstado(''); setFHistMes(''); setFHistProducto(''); setFHistTipo(''); setFHistCliente(''); setFHistFecha(''); }}
            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#E2E8F0', color: '#475569', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
          >
            Limpiar Filtros
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
              <tr>
                <th style={{ padding: '12px', color: '#555' }}>Fecha Venta</th>
                <th style={{ padding: '12px', color: '#555' }}>Tipo</th>
                <th style={{ padding: '12px', color: '#555' }}>ID/Orden</th>
                <th style={{ padding: '12px', color: '#555' }}>Cliente (RUT)</th>
                <th style={{ padding: '12px', color: '#555' }}>Producto</th>
                <th style={{ padding: '12px', color: '#555' }}>Estado</th>
                <th style={{ padding: '12px', color: '#555' }}>Mes Origen / Penaliz.</th>
              </tr>
            </thead>
            <tbody>
              {listaVentas.filter(v => {
                if (fHistEstado && (v.estado || '').toUpperCase() !== fHistEstado.toUpperCase()) return false;
                if (fHistMes && !(v.fecha_ingreso || '').startsWith(fHistMes)) return false;
                if (fHistProducto && !(v.producto || '').toLowerCase().includes(fHistProducto.toLowerCase())) return false;
                if (fHistTipo && (v.tipo_servicio || '').toUpperCase() !== fHistTipo.toUpperCase()) return false;
                if (fHistCliente && !(v.rut_cliente || '').toLowerCase().includes(fHistCliente.toLowerCase())) return false;
                if (fHistFecha && v.fecha_ingreso !== fHistFecha) return false;
                return true;
              }).length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                    No se encontraron ventas con esos filtros.
                  </td>
                </tr>
              ) : (
                listaVentas.filter(v => {
                  if (fHistEstado && (v.estado || '').toUpperCase() !== fHistEstado.toUpperCase()) return false;
                  if (fHistMes && !(v.fecha_ingreso || '').startsWith(fHistMes)) return false;
                  if (fHistProducto && !(v.producto || '').toLowerCase().includes(fHistProducto.toLowerCase())) return false;
                  if (fHistTipo && (v.tipo_servicio || '').toUpperCase() !== fHistTipo.toUpperCase()) return false;
                  if (fHistCliente && !(v.rut_cliente || '').toLowerCase().includes(fHistCliente.toLowerCase())) return false;
                  if (fHistFecha && v.fecha_ingreso !== fHistFecha) return false;
                  return true;
                }).map((venta, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{venta.fecha_ingreso || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        backgroundColor: venta.tipo_servicio?.toLowerCase() === 'fijo' ? '#E3F2FD' : '#F3E5F5',
                        color: venta.tipo_servicio?.toLowerCase() === 'fijo' ? '#1565C0' : '#6A1B9A',
                        padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold'
                      }}>
                        {venta.tipo_servicio || 'Móvil'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>{venta.numero_orden || '-'}</td>
                    <td style={{ padding: '12px', color: '#555' }}>{venta.rut_cliente || '-'}</td>
                    <td style={{ padding: '12px', color: '#555' }}>{venta.producto || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={estadoColor(venta.estado)}>
                        {venta.estado || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {venta.esPenalizada && venta.mesPenalizacion ? (
                        <span style={{ color: '#DC2626', fontWeight: 'bold' }} title={`Venta original: ${venta.fecha_ingreso ? venta.fecha_ingreso.substring(0, 7) : '-'}`}>
                          {venta.mesPenalizacion.length === 6 ? `${venta.mesPenalizacion.substring(0,4)}-${venta.mesPenalizacion.substring(4,6)}` : venta.mesPenalizacion} (Penaliz.)
                        </span>
                      ) : (
                        <span style={{ color: '#888' }}>
                          {venta.fecha_ingreso ? venta.fecha_ingreso.substring(0, 7) : '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalisisEjecutivo;