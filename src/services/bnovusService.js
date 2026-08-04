import { supabase } from '../supabaseClient';

const BNOVUS_SEMILLA = '6E2A5541-6770-4592-8966-E7DE4CBBA462';

// Endpoints de Bnovus
const API_URL_QA   = 'https://webapibncore.azurewebsites.net';
const API_URL_PROD = 'https://webapibnovuscoreqa.azurewebsites.net';

// Helper para limpiar y formatear RUT (Ej: 12345678-K)
export const normalizarRut = (rut) => {
  if (!rut) return '';
  let str = String(rut).replace(/[^0-9kK]/g, '').toUpperCase();
  if (str.length < 2) return str;
  const dv = str.slice(-1);
  const cuerpo = str.slice(0, -1);
  return `${cuerpo}-${dv}`;
};

/**
 * Consulta la API de Bnovus para obtener el libro de asistencia por rango de fechas
 */
export const fetchAsistenciaBnovus = async (fechaInicio, fechaTermino) => {
  const payload = {
    fechaInicio: `${fechaInicio}T00:00:00`,
    fechaTermino: `${fechaTermino}T23:59:59`
  };

  const headers = {
    'Content-Type': 'application/json',
    'semilla': BNOVUS_SEMILLA,
    'Semilla': BNOVUS_SEMILLA
  };

  try {
    // Intentar primero con el endpoint principal
    let res = await fetch(`${API_URL_QA}/v2/LibroAsistencia/ObtenerAsistenciaPorFechas`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // Fallback al endpoint de producción si el de QA da error
      res = await fetch(`${API_URL_PROD}/v2/LibroAsistencia/ObtenerAsistenciaPorFechas`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      throw new Error(`Bnovus API HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data || [];
  } catch (err) {
    console.warn('Advertencia al consultar API Bnovus:', err);
    throw err;
  }
};

/**
 * Sincroniza la asistencia de un ejecutivo específico con Supabase
 */
export const sincronizarAsistenciaEjecutivo = async (ejecutivoId, rutEjecutivo) => {
  if (!rutEjecutivo) throw new Error('El ejecutivo no tiene RUT registrado.');

  const rutLimpio = normalizarRut(rutEjecutivo);
  const hoy = new Date();
  
  // Consultar últimos 6 meses
  const fechaHace6Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);
  const fechaInicio = fechaHace6Meses.toISOString().split('T')[0];
  const fechaTermino = hoy.toISOString().split('T')[0];

  try {
    const dataBnovus = await fetchAsistenciaBnovus(fechaInicio, fechaTermino);

    // Buscar registros que coincidan con el RUT del ejecutivo
    const registrosEjecutivo = dataBnovus.filter(item => {
      const rutItem = normalizarRut(item.colaboradorRUT);
      return rutItem === rutLimpio || item.colaboradorRUT?.includes(rutEjecutivo.replace(/\D/g, ''));
    });

    let asistenciasAInsertar = [];

    registrosEjecutivo.forEach(item => {
      const listado = item.listado || [];
      listado.forEach(a => {
        const fechaStr = a.fecha ? a.fecha.split('T')[0] : '';
        if (!fechaStr) return;

        const periodoStr = fechaStr.substring(0, 7);
        asistenciasAInsertar.push({
          ejecutivo_id: ejecutivoId,
          rut_colaborador: rutLimpio,
          fecha: fechaStr,
          periodo: periodoStr,
          presente: !a.ausencia,
          ausente: !!a.ausencia,
          es_licencia: !!a.esLicencia,
          es_vacaciones: !!a.esVacaciones,
          es_permiso: !!a.esPermisoSinGoce || !!a.permisoNombre,
          nombre_permiso: a.permisoNombre || null,
          horas_trabajadas: Number(a.horasTrabajadas) || 0,
          horas_atraso: Number(a.horaAtrasoEntrada) || 0
        });
      });
    });

    if (asistenciasAInsertar.length > 0) {
      // Upsert en Supabase
      const { error } = await supabase
        .from('asistencia_bnovus')
        .upsert(asistenciasAInsertar, { onConflict: 'rut_colaborador,fecha' });

      if (error) throw new Error('Error al guardar asistencia en Supabase: ' + error.message);
    }

    return asistenciasAInsertar;
  } catch (err) {
    console.error('Error en sincronizarAsistenciaEjecutivo:', err);
    throw err;
  }
};

/**
 * Obtiene la asistencia guardada desde Supabase para un ejecutivo
 */
export const obtenerAsistenciaGuardada = async (ejecutivoId, rutEjecutivo) => {
  const rutLimpio = normalizarRut(rutEjecutivo);

  const { data, error } = await supabase
    .from('asistencia_bnovus')
    .select('*')
    .or(`ejecutivo_id.eq.${ejecutivoId}${rutLimpio ? `,rut_colaborador.eq.${rutLimpio}` : ''}`)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al obtener asistencia desde Supabase:', error);
    return [];
  }
  return data || [];
};
