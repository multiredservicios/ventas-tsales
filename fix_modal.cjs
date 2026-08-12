const fs = require('fs');

let ejCode = fs.readFileSync('src/pages/Ejecutivos.jsx', 'utf8');

// The modal code to inject
const modalCode = `
      {/* Modal de Edición de Ejecutivo */}
      {ejecutivoEditando && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setEjecutivoEditando(null)}></div>
          <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: 16, width: '100%', maxWidth: 480, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Editar Ejecutivo</h3>
              <button onClick={() => setEjecutivoEditando(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 20, padding: 4 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Nombre completo</label>
                <input type="text" value={ejecutivoEditando.nombre} onChange={e => setEjecutivoEditando({...ejecutivoEditando, nombre: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>RUT</label>
                  <input type="text" value={ejecutivoEditando.rut || ''} onChange={e => setEjecutivoEditando({...ejecutivoEditando, rut: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Teléfono</label>
                  <input type="text" value={ejecutivoEditando.telefono || ''} onChange={e => setEjecutivoEditando({...ejecutivoEditando, telefono: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Cargo</label>
                  <input type="text" value={ejecutivoEditando.cargo || ''} onChange={e => setEjecutivoEditando({...ejecutivoEditando, cargo: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Tipo Contrato</label>
                  <select value={ejecutivoEditando.tipo_contrato || 'CONTRATADO'} onChange={e => setEjecutivoEditando({...ejecutivoEditando, tipo_contrato: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}>
                    <option value="CONTRATADO">CONTRATADO</option>
                    <option value="FREELANCE">FREELANCE</option>
                    <option value="FREELANCE EMPRESA">FREELANCE EMPRESA</option>
                  </select>
                </div>
              </div>

              {/* Sección de Alias */}
              <div style={{ marginTop: '4px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '8px', fontWeight: 600 }}>🔗 Alias (nombres alternativos en archivos)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {aliasEditando.map(a => (
                    <span key={a.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#F1F5F9', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', color: '#334155' }}>
                      {a.alias}
                      <button onClick={() => eliminarAlias(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                  {aliasEditando.length === 0 && <span style={{ fontSize: '12px', color: '#94A3B8' }}>Sin alias configurados</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" value={nuevoAlias} onChange={e => setNuevoAlias(e.target.value)} placeholder="Ej: DANILO_ALVAREZ" onKeyDown={e => e.key === 'Enter' && agregarAlias()} style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }} />
                  <button onClick={agregarAlias} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#3B82F6', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>+ Agregar</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button onClick={() => setEjecutivoEditando(null)} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #CBD5E1', backgroundColor: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={() => {
                  actualizarEjecutivo(ejecutivoEditando.id, {
                    nombre: ejecutivoEditando.nombre,
                    rut: ejecutivoEditando.rut,
                    telefono: ejecutivoEditando.telefono,
                    cargo: ejecutivoEditando.cargo,
                    tipo_contrato: ejecutivoEditando.tipo_contrato
                  });
                  setEjecutivoEditando(null);
                }} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#00897B', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}`;

ejCode = ejCode.replace(
  '    </div>\n  );\n}\n\nexport default Ejecutivos;',
  modalCode + '\n    </div>\n  );\n}\n\nexport default Ejecutivos;'
);

fs.writeFileSync('src/pages/Ejecutivos.jsx', ejCode);
