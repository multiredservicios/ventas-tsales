export const normalizarEjecutivo = (nombre) => {
  if (!nombre) return nombre;
  
  const n = String(nombre).trim().toUpperCase();

  if (n === 'FIBRA TOTAL' || n === 'FIBRATOTAL') {
    return 'FIBRA TOTAL';
  }

  return n;
};
