const fs = require('fs');
let code = fs.readFileSync('src/pages/Ejecutivos.jsx', 'utf8');

// 1. Add States
const stateHooks = `
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [ejecutivoEditando, setEjecutivoEditando] = useState(null);
`;
code = code.replace(/(const \[sortDir, setSortDir\]\s*=\s*useState\('asc'\);)/, `$1\n${stateHooks}`);

// 2. Add Functions
const funcCode = `
  const actualizarEjecutivo = async (id, datos) => {
    try {
      const { error } = await supabase.from('ejecutivos').update(datos).eq('id', id);
      if (error) throw error;
      setEjecutivos(prev => prev.map(e => e.id === id ? { ...e, ...datos } : e));
    } catch(e) { alert('Error al actualizar: ' + e.message); }
  };

  const eliminarEjecutivo = async (id) => {
    if(!window.confirm('¿Eliminar definitivamente este ejecutivo? Esto borrará el registro para siempre.')) return;
    try {
      const { error } = await supabase.from('ejecutivos').delete().eq('id', id);
      if (error) throw error;
      setEjecutivos(prev => prev.filter(e => e.id !== id));
    } catch(e) { alert('Error al eliminar: ' + e.message); }
  };
`;
code = code.replace(/(const obtener = async \(\) => {)/, `${funcCode}\n  $1`);

// 3. Update table row rendering (tipo_contrato badge)
code = code.replace(
  /const esFL\s*=\s*ej\.tipo_contrato === 'FREELANCE';/,
  `const esFL  = ej.tipo_contrato === 'FREELANCE';\n              const esFLE = ej.tipo_contrato === 'FREELANCE EMPRESA';\n              let bgCont = '#E3F2FD', txtCont = '#1565C0';\n              if (esFL) { bgCont = '#FCE4EC'; txtCont = '#C62828'; }\n              if (esFLE) { bgCont = '#D1FAE5'; txtCont = '#047857'; }`
);

code = code.replace(
  /<span style=\{pill\(esFL \? '#FCE4EC' : '#E3F2FD', esFL \? '#C62828' : '#1565C0'\)\}>/,
  `<span style={pill(bgCont, txtCont)}>`
);

// 4. Update dropdown menu
const dropdownMenu = `
                      <button onClick={() => setMenuAbierto(menuAbierto === ej.id ? null : ej.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, backgroundColor: T.gray100, color: T.gray600, border: 'none', cursor: 'pointer' }}>
                        <IcoDots />
                      </button>
                      {menuAbierto === ej.id && (
                        <>
                          <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setMenuAbierto(null)}></div>
                          <div style={{ position: 'absolute', right: '50px', marginTop: '30px', backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 8, padding: 8, zIndex: 10, width: 220, display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left', border: '1px solid #E2E8F0' }}>
                            <button onClick={() => { setEjecutivoEditando(ej); setMenuAbierto(null); }} style={{ padding: '8px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}>✏️ Editar Ejecutivo</button>
                            <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #F1F5F9' }} />
                            <button onClick={() => { actualizarEjecutivo(ej.id, { tipo_contrato: 'CONTRATADO' }); setMenuAbierto(null); }} style={{ padding: '8px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}>🔄 Cambiar a Contratado</button>
                            <button onClick={() => { actualizarEjecutivo(ej.id, { tipo_contrato: 'FREELANCE' }); setMenuAbierto(null); }} style={{ padding: '8px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}>🔄 Cambiar a Freelance</button>
                            <button onClick={() => { actualizarEjecutivo(ej.id, { tipo_contrato: 'FREELANCE EMPRESA' }); setMenuAbierto(null); }} style={{ padding: '8px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}>🔄 Cambiar a Freelance Empresa</button>
                            <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #F1F5F9' }} />
                            <button onClick={() => { actualizarEjecutivo(ej.id, { activo: ej.activo === false ? true : false }); setMenuAbierto(null); }} style={{ padding: '8px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}>🛑 {ej.activo === false ? 'Activar Ejecutivo' : 'Desactivar Ejecutivo'}</button>
                            <button onClick={() => { eliminarEjecutivo(ej.id); setMenuAbierto(null); }} style={{ padding: '8px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: '#DC2626', fontWeight: 'bold' }}>❌ Eliminar Definitivo</button>
                          </div>
                        </>
                      )}
`;

code = code.replace(
  /<button style=\{\{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, backgroundColor: T\.gray100, color: T\.gray600, border: 'none', cursor: 'pointer' \}\}>\s*<IcoDots \/>\s*<\/button>/,
  dropdownMenu
);

// 5. Update footer summary
const footerStr1 = `<span>Freelance: <strong style={{ color: T.orange }}>{filtrada.filter(e=>e.tipo_contrato==='FREELANCE').length}</strong></span>`;
const footerStr2 = `<span>Freelance Emp: <strong style={{ color: T.teal }}>{filtrada.filter(e=>e.tipo_contrato==='FREELANCE EMPRESA').length}</strong></span>`;
code = code.replace(footerStr1, `${footerStr1}\n            ${footerStr2}`);


// 6. Append Edit Modal
const editModal = `
      {ejecutivoEditando && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>✏️ Editar Ejecutivo</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Nombre completo</label>
                <input type="text" value={ejecutivoEditando.nombre || ''} onChange={e => setEjecutivoEditando({...ejecutivoEditando, nombre: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>RUT</label>
                <input type="text" value={ejecutivoEditando.rut || ''} onChange={e => setEjecutivoEditando({...ejecutivoEditando, rut: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Cargo</label>
                <input type="text" value={ejecutivoEditando.cargo || ''} onChange={e => setEjecutivoEditando({...ejecutivoEditando, cargo: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Supervisor</label>
                <input type="text" value={ejecutivoEditando.supervisor || ''} onChange={e => setEjecutivoEditando({...ejecutivoEditando, supervisor: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Canal</label>
                <input type="text" value={ejecutivoEditando.canal || ''} onChange={e => setEjecutivoEditando({...ejecutivoEditando, canal: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Tipo de Contrato</label>
                <select value={ejecutivoEditando.tipo_contrato || 'CONTRATADO'} onChange={e => setEjecutivoEditando({...ejecutivoEditando, tipo_contrato: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}>
                  <option value="CONTRATADO">CONTRATADO</option>
                  <option value="FREELANCE">FREELANCE</option>
                  <option value="FREELANCE EMPRESA">FREELANCE EMPRESA</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEjecutivoEditando(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => { actualizarEjecutivo(ejecutivoEditando.id, ejecutivoEditando); setEjecutivoEditando(null); }} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#10B981', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*);?\s*}\s*export default Ejecutivos;/, `${editModal}\n$1\n}\n\nexport default Ejecutivos;`);

fs.writeFileSync('src/pages/Ejecutivos.jsx', code);
console.log('Script done!');
