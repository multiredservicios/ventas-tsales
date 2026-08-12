const fs = require('fs');

// ====================================================================
// 1. VentasFijo.jsx - Add alias support when mapping ejecutivos
// ====================================================================
let fijoCode = fs.readFileSync('src/pages/VentasFijo.jsx', 'utf8');

// Replace the mapaEj creation to also load aliases
const oldFijoMap = `      // 4. Mapear ventas con ejecutivo_id y supervisor_id (si existe la columna)
      const mapaEj = {};
      todosEjActualizados.forEach(e => { mapaEj[e.nombre.trim().toUpperCase()] = e.id; });`;

const newFijoMap = `      // 4. Mapear ventas con ejecutivo_id y supervisor_id (incluyendo alias)
      const mapaEj = {};
      todosEjActualizados.forEach(e => { mapaEj[e.nombre.trim().toUpperCase()] = e.id; });
      
      // Cargar alias de ejecutivos para resolver nombres alternativos
      const { data: aliasData } = await supabase.from('ejecutivo_alias').select('alias, ejecutivo_id');
      if (aliasData) {
        aliasData.forEach(a => { mapaEj[a.alias.trim().toUpperCase()] = a.ejecutivo_id; });
      }`;

fijoCode = fijoCode.replace(oldFijoMap, newFijoMap);
fs.writeFileSync('src/pages/VentasFijo.jsx', fijoCode);
console.log('✅ VentasFijo.jsx updated with alias support');


// ====================================================================
// 2. VentasMovil.jsx - Add alias support when mapping ejecutivos
// ====================================================================
let movilCode = fs.readFileSync('src/pages/VentasMovil.jsx', 'utf8');

// In VentasMovil, the matching is done with todosEj.find()
// We need to load aliases and add them to the lookup
const oldMovilFind = `      const ventasGuardar = datosVentas.map((v) => {
        const nombreEj = (v.ejecutivo || '').trim().toUpperCase();
        const ej = todosEj.find((e) => e.nombre.trim().toUpperCase() === nombreEj);`;

const newMovilFind = `      // Cargar alias de ejecutivos
      const { data: aliasData } = await supabase.from('ejecutivo_alias').select('alias, ejecutivo_id');
      const aliasMap = {};
      if (aliasData) {
        aliasData.forEach(a => { aliasMap[a.alias.trim().toUpperCase()] = a.ejecutivo_id; });
      }

      const ventasGuardar = datosVentas.map((v) => {
        const nombreEj = (v.ejecutivo || '').trim().toUpperCase();
        let ej = todosEj.find((e) => e.nombre.trim().toUpperCase() === nombreEj);
        // Si no hay match directo, buscar en alias
        if (!ej && aliasMap[nombreEj]) {
          ej = todosEj.find(e => e.id === aliasMap[nombreEj]);
        }`;

movilCode = movilCode.replace(oldMovilFind, newMovilFind);
fs.writeFileSync('src/pages/VentasMovil.jsx', movilCode);
console.log('✅ VentasMovil.jsx updated with alias support');


// ====================================================================
// 3. Penalizaciones.jsx - Add alias support when mapping ejecutivos
// ====================================================================
let penCode = fs.readFileSync('src/pages/Penalizaciones.jsx', 'utf8');

const oldPenMap = `      const mapaEj = {};
      todosEjActualizados.forEach(e => {
        mapaEj[e.nombre.trim().toUpperCase()] = e.id;
      });`;

const newPenMap = `      const mapaEj = {};
      todosEjActualizados.forEach(e => {
        mapaEj[e.nombre.trim().toUpperCase()] = e.id;
      });
      
      // Cargar alias de ejecutivos
      const { data: aliasData } = await supabase.from('ejecutivo_alias').select('alias, ejecutivo_id');
      if (aliasData) {
        aliasData.forEach(a => { mapaEj[a.alias.trim().toUpperCase()] = a.ejecutivo_id; });
      }`;

penCode = penCode.replace(oldPenMap, newPenMap);
fs.writeFileSync('src/pages/Penalizaciones.jsx', penCode);
console.log('✅ Penalizaciones.jsx updated with alias support');


// ====================================================================
// 4. Ejecutivos.jsx - Add alias management in the edit modal
// ====================================================================
let ejCode = fs.readFileSync('src/pages/Ejecutivos.jsx', 'utf8');

// Add state for alias list
ejCode = ejCode.replace(
  'const [ejecutivoEditando, setEjecutivoEditando] = useState(null);',
  `const [ejecutivoEditando, setEjecutivoEditando] = useState(null);
  const [aliasEditando, setAliasEditando] = useState([]);
  const [nuevoAlias, setNuevoAlias] = useState('');`
);

// Add functions for alias CRUD
const aliasFunctions = `
  const cargarAlias = async (ejecutivoId) => {
    const { data } = await supabase.from('ejecutivo_alias').select('*').eq('ejecutivo_id', ejecutivoId);
    setAliasEditando(data || []);
  };

  const agregarAlias = async () => {
    if (!nuevoAlias.trim() || !ejecutivoEditando?.id) return;
    const { data, error } = await supabase.from('ejecutivo_alias').insert({
      alias: nuevoAlias.trim().toUpperCase(),
      ejecutivo_id: ejecutivoEditando.id
    }).select().single();
    if (error) { alert('Error: ' + error.message); return; }
    setAliasEditando(prev => [...prev, data]);
    setNuevoAlias('');
  };

  const eliminarAlias = async (aliasId) => {
    await supabase.from('ejecutivo_alias').delete().eq('id', aliasId);
    setAliasEditando(prev => prev.filter(a => a.id !== aliasId));
  };
`;

ejCode = ejCode.replace(
  'const actualizarEjecutivo = async',
  aliasFunctions + '\n  const actualizarEjecutivo = async'
);

// Update the "Editar" button click to also load aliases
ejCode = ejCode.replace(
  "onClick={() => { setEjecutivoEditando(ej); setMenuAbierto(null); }}",
  "onClick={() => { setEjecutivoEditando(ej); cargarAlias(ej.id); setNuevoAlias(''); setMenuAbierto(null); }}"
);

// Add alias section to the edit modal (before the buttons div)
const aliasSection = `
            <div style={{ marginTop: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '8px', fontWeight: 600 }}>🔗 Alias (nombres alternativos en archivos)</label>
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
                <input type="text" value={nuevoAlias} onChange={e => setNuevoAlias(e.target.value)} placeholder="Ej: DANILO_ALVAREZ" onKeyDown={e => e.key === 'Enter' && agregarAlias()} style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }} />
                <button onClick={agregarAlias} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#3B82F6', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>+ Agregar</button>
              </div>
            </div>
`;

ejCode = ejCode.replace(
  `<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEjecutivoEditando(null)}`,
  `${aliasSection}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEjecutivoEditando(null)}`
);

fs.writeFileSync('src/pages/Ejecutivos.jsx', ejCode);
console.log('✅ Ejecutivos.jsx updated with alias management UI');

console.log('\\n🎉 All files updated! Now need to create the ejecutivo_alias table in Supabase.');
