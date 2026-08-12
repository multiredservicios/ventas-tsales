const fs = require('fs');
let code = fs.readFileSync('src/pages/AnalisisEjecutivo.jsx', 'utf8');

// 1. Add pagination state
code = code.replace(
  'const [fHistFecha, setFHistFecha] = useState(\'\');',
  'const [fHistFecha, setFHistFecha] = useState(\'\');\n  const [paginaHist, setPaginaHist] = useState(1);'
);

// 2. Add computation block before return
const calcBlock = `
  // --- PAGINACIÓN HISTORIA DE VENTAS ---
  const ventasFiltradas = listaVentas.filter(v => {
    if (fHistEstado && (v.estado || '').toUpperCase() !== fHistEstado.toUpperCase()) return false;
    if (fHistMes && !(v.fecha_ingreso || '').startsWith(fHistMes)) return false;
    if (fHistProducto && !(v.producto || '').toLowerCase().includes(fHistProducto.toLowerCase())) return false;
    if (fHistTipo && (v.tipo_servicio || '').toUpperCase() !== fHistTipo.toUpperCase()) return false;
    if (fHistCliente && !(v.rut_cliente || '').toLowerCase().includes(fHistCliente.toLowerCase())) return false;
    if (fHistFecha && v.fecha_ingreso !== fHistFecha) return false;
    return true;
  });

  const itemsPorPaginaHist = 20;
  const totalPaginasHist = Math.ceil(ventasFiltradas.length / itemsPorPaginaHist) || 1;
  const inicioHist = (paginaHist - 1) * itemsPorPaginaHist;
  const finHist = inicioHist + itemsPorPaginaHist;
  const ventasPaginadas = ventasFiltradas.slice(inicioHist, finHist);

  // Reset pagination on filter change
  useEffect(() => {
    setPaginaHist(1);
  }, [fHistEstado, fHistMes, fHistProducto, fHistTipo, fHistCliente, fHistFecha]);
`;

code = code.replace(
  '  return (',
  calcBlock + '\n  return ('
);

// 3. Replace the table rendering
const tbodyStart = code.indexOf('<tbody>', code.lastIndexOf('<thead style={{ backgroundColor: \'#f8f9fa\', borderBottom: \'2px solid #ddd\' }}>'));
const tbodyEnd = code.indexOf('</tbody>', tbodyStart);

const newTbody = `<tbody>
              {ventasPaginadas.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                    No se encontraron ventas con esos filtros.
                  </td>
                </tr>
              ) : (
                ventasPaginadas.map((venta, index) => (
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
                        <span style={{ color: '#DC2626', fontWeight: 'bold' }}>
                          {venta.mesPenalizacion.length === 6 ? \`\${venta.mesPenalizacion.substring(0,4)}-\${venta.mesPenalizacion.substring(4,6)}\` : venta.mesPenalizacion}
                        </span>
                      ) : (
                        <span style={{ color: '#888' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>`;

code = code.substring(0, tbodyStart) + newTbody + code.substring(tbodyEnd + 8);

// 4. Add pagination controls after the table
const paginationControls = `
          {totalPaginasHist > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px', padding: '10px' }}>
              <button 
                onClick={() => setPaginaHist(p => Math.max(1, p - 1))}
                disabled={paginaHist === 1}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: paginaHist === 1 ? '#F1F5F9' : 'white', color: paginaHist === 1 ? '#94A3B8' : '#334155', cursor: paginaHist === 1 ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                Anterior
              </button>
              <span style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                Página {paginaHist} de {totalPaginasHist}
              </span>
              <button 
                onClick={() => setPaginaHist(p => Math.min(totalPaginasHist, p + 1))}
                disabled={paginaHist === totalPaginasHist}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: paginaHist === totalPaginasHist ? '#F1F5F9' : 'white', color: paginaHist === totalPaginasHist ? '#94A3B8' : '#334155', cursor: paginaHist === totalPaginasHist ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                Siguiente
              </button>
            </div>
          )}
`;

const tableEnd = code.indexOf('</table>\n        </div>', tbodyStart);
if (tableEnd !== -1) {
   code = code.substring(0, tableEnd + 23) + paginationControls + code.substring(tableEnd + 23);
}

fs.writeFileSync('src/pages/AnalisisEjecutivo.jsx', code);
console.log('Pagination applied successfully!');
