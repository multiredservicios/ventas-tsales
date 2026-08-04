import { supabase } from '../supabaseClient';

const BNOVUS_SEMILLA = '6E2A5541-6770-4592-8966-E7DE4CBBA462';

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
 * Obtiene el JWT Bearer Token de Bnovus autenticando la Semilla en /v1/Token
 */
export const obtenerTokenBnovus = async () => {
  const tokenEndpoints = [
    '/api-bnovus-qa/v1/Token',
    'https://webapibncore.azurewebsites.net/v1/Token',
    'https://corsproxy.io/?' + encodeURIComponent('https://webapibncore.azurewebsites.net/v1/Token')
  ];

  let lastErr = null;
  for (const url of tokenEndpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semilla: BNOVUS_SEMILLA })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.token) {
          return data.token;
        }
      }
    } catch (err) {
      lastErr = err;
    }
  }

  throw new Error('Error de Autenticación Bnovus: No se pudo obtener el Token JWT. ' + (lastErr ? lastErr.message : ''));
};

/**
 * Consulta la API de Bnovus para obtener el libro de asistencia por rango de fechas
 */
export const fetchAsistenciaBnovus = async (fechaInicio, fechaTermino, rutColaborador) => {
  // 1. Obtener Token JWT
  const token = await obtenerTokenBnovus();

  const payload = {
    fechaInicio: `${fechaInicio}T00:00:00`,
    fechaTermino: `${fechaTermino}T23:59:59`,
    colaboradores: [{ rut: rutColaborador }]
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const targetPath = '/v2/LibroAsistencia';
  const asistenciaEndpoints = [
    `/api-bnovus-qa${targetPath}`,
    `https://webapibncore.azurewebsites.net${targetPath}`,
    `https://corsproxy.io/?` + encodeURIComponent(`https://webapibncore.azurewebsites.net${targetPath}`)
  ];

  let lastErr = null;
  for (const url of asistenciaEndpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data)) {
          return data;
        }
      }
    } catch (err) {
      lastErr = err;
    }
  }

  throw new Error(`Error Bnovus: No se pudo consultar la asistencia. (${lastErr ? lastErr.message : ''})`);
};

/**
 * Sincroniza la asistencia de un ejecutivo específico por RUT o por NOMBRE
 */
export const sincronizarAsistenciaEjecutivo = async (ejecutivoId, rutEjecutivo, nombreEjecutivo) => {
  const rutLimpio = normalizarRut(rutEjecutivo);

  if (!rutLimpio) {
    throw new Error('El ejecutivo no tiene el RUT registrado para sincronizar. Por favor, edita el ejecutivo y agrega su RUT.');
  }

  const hoy = new Date();
  // Obtener desde el 1 de enero del año actual
  const fechaInicio = `${hoy.getFullYear()}-01-01`;
  const fechaTermino = hoy.toISOString().split('T')[0];

  try {
    const rutNumber = parseInt(rutLimpio.replace(/\D/g, '').slice(0, -1));
    const dataBnovus = await fetchAsistenciaBnovus(fechaInicio, fechaTermino, rutNumber);

    // Coincidencia estricta por RUT, ya que el endpoint específico filtra correctamente.
    const registrosEjecutivo = dataBnovus;

    let asistenciasAInsertar = [];
    let rutDetectadoDesdeBnovus = rutLimpio;

    registrosEjecutivo.forEach(item => {
      if (!rutDetectadoDesdeBnovus && item.colaboradorRUT) {
        rutDetectadoDesdeBnovus = normalizarRut(item.colaboradorRUT);
      }

      const listado = item.listado || [];
      listado.forEach(a => {
        const fechaStr = a.fecha ? a.fecha.split('T')[0] : '';
        if (!fechaStr) return;

        const periodoStr = fechaStr.substring(0, 7);
        const permisoNombreStr = (a.permisoNombre || '').toLowerCase();
        
        // Detectar licencia si el booleano es true o si el nombre del permiso lo indica
        const esLicencia = a.esLicencia === true || permisoNombreStr.includes('licencia') || permisoNombreStr.includes('medica') || permisoNombreStr.includes('médica');
        
        // Detectar vacaciones
        const esVacaciones = a.esVacaciones === true || permisoNombreStr.includes('vacacion');
        
        // Detectar cualquier otro tipo de permiso (si tiene nombre de permiso, ya es una ausencia justificada)
        const esPermiso = a.esPermisoSinGoce === true || permisoNombreStr.includes('permiso') || (a.permisoNombre ? (!esLicencia && !esVacaciones) : false);

        asistenciasAInsertar.push({
          ejecutivo_id: ejecutivoId,
          rut_colaborador: rutDetectadoDesdeBnovus || 'SIN-RUT',
          fecha: fechaStr,
          periodo: periodoStr,
          presente: a.ausencia === false && a.horasTrabajadas > 0,
          ausente: a.ausencia === true,
          es_licencia: esLicencia,
          es_vacaciones: esVacaciones,
          es_permiso: esPermiso,
          nombre_permiso: a.permisoNombre || null,
          horas_trabajadas: Number(a.horasTrabajadas) || 0,
          horas_atraso: Number(a.horaAtrasoEntrada) || 0
        });
      });
    });

    // Actualizar RUT en Supabase si el ejecutivo no lo tenía
    if (rutDetectadoDesdeBnovus && (!rutEjecutivo || rutEjecutivo.trim() === '')) {
      await supabase
        .from('ejecutivos')
        .update({ rut: rutDetectadoDesdeBnovus })
        .eq('id', ejecutivoId);
    }

    if (asistenciasAInsertar.length > 0) {
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
 * Obtiene la asistencia guardada desde Supabase por ejecutivoId o RUT
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
