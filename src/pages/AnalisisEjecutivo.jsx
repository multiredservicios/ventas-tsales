import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabaseClient';

function AnalisisEjecutivo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ejecutivo, setEjecutivo] = useState(null);
  const [supervisor, setSupervisor] = useState(null); // datos del supervisor

  const [datosGrafico, setDatosGrafico] = useState([]);
  const [kpis, setKpis] = useState({ totales: 0, penalizadas: 0, tasa: 0 });
  const [listaVentas, setListaVentas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerDatosYVentas();
  }, [id]);

  const obtenerDatosYVentas = async () => {
    setCargando(true);

    // Traer datos del ejecutivo
    const { data: dataEjecutivo } = await supabase
      .from('ejecutivos')
      .select('*')
      .eq('id', id)
      .single();

    if (dataEjecutivo) {
      setEjecutivo(dataEjecutivo);

      // Si tiene supervisor registrado, buscarlo por nombre en la tabla ejecutivos
      if (dataEjecutivo.supervisor && dataEjecutivo.supervisor !== 'Sin Supervisor') {
        const { data: dataSup } = await supabase
          .from('ejecutivos')
          .select('id, nombre, rut, correo, canal')
          .ilike('nombre', dataEjecutivo.supervisor)
          .maybeSingle();
        if (dataSup) setSupervisor(dataSup);
      }
    }

    // Traer TODAS las ventas de este ejecutivo
    const { data: dataVentas } = await supabase
      .from('ventas')
      .select('*')
      .eq('ejecutivo_id', id)
      .order('fecha_ingreso', { ascending: false });

    if (dataVentas) {
      setListaVentas(dataVentas);
      procesarEstadisticas(dataVentas);
    }

    setCargando(false);
  };

  const procesarEstadisticas = (ventas) => {
    const totales = ventas.length;
    const penalizadas = ventas.filter(
      (v) => v.estado === 'CAIDA' || v.estado === 'RECHAZADA' || v.estado === 'PENALIZADA'
    ).length;
    const tasa = totales > 0 ? Math.round((penalizadas / totales) * 100) : 0;

    setKpis({ totales, penalizadas, tasa });

    const agrupadoPorMes = {};
    ventas.forEach((venta) => {
      const mes = venta.fecha_ingreso ? venta.fecha_ingreso.substring(0, 7) : 'Sin fecha';
      if (!agrupadoPorMes[mes]) {
        agrupadoPorMes[mes] = { periodo: mes, ventas: 0, penalizadas: 0 };
      }
      agrupadoPorMes[mes].ventas += 1;
      if (venta.estado === 'CAIDA' || venta.estado === 'RECHAZADA' || venta.estado === 'PENALIZADA') {
        agrupadoPorMes[mes].penalizadas += 1;
      }
    });

    const datosOrdenados = Object.values(agrupadoPorMes).sort((a, b) =>
      a.periodo.localeCompare(b.periodo)
    );
    setDatosGrafico(datosOrdenados);
  };

  /* ── Calcular ventana de penalizaciones por tipo y meses ── */
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
      const penalizadas = del_periodo.filter(v =>
        ['CAIDA', 'RECHAZADA', 'PENALIZADA'].includes((v.estado || '').toUpperCase())
      ).length;
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
          <p style={{ margin: '8px 0' }}><strong>RUT:</strong> {ejecutivo.rut}</p>
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

        {/* KPIs */}
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

      {/* TABLAS DE PENALIZACIONES 3M y 6M */}
      {listaVentas.length > 0 && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>📌 Penalizaciones por Ventana de Tiempo</h3>
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

      {/* GRÁFICO */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '20px', marginTop: 0 }}>📈 Ventas totales (azul) con tramo penalizado (rojo) por mes</h3>

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

      {/* TABLA DE HISTORIA DE VENTAS */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>📄 Historia de ventas</h3>
          <span style={{ fontSize: '13px', color: '#888' }}>{listaVentas.length} registros</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
              <tr>
                <th style={{ padding: '12px', color: '#555' }}>Fecha</th>
                <th style={{ padding: '12px', color: '#555' }}>Tipo</th>
                <th style={{ padding: '12px', color: '#555' }}>ID/Orden</th>
                <th style={{ padding: '12px', color: '#555' }}>Cliente (RUT)</th>
                <th style={{ padding: '12px', color: '#555' }}>Producto</th>
                <th style={{ padding: '12px', color: '#555' }}>Estado</th>
                <th style={{ padding: '12px', color: '#555' }}>Periodo</th>
              </tr>
            </thead>
            <tbody>
              {listaVentas.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                    No hay ventas registradas para este ejecutivo.
                  </td>
                </tr>
              ) : (
                listaVentas.map((venta, index) => (
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
                    <td style={{ padding: '12px', color: '#888', fontSize: '12px' }}>
                      {venta.fecha_ingreso ? venta.fecha_ingreso.substring(0, 7).replace('-', '') : '-'}
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