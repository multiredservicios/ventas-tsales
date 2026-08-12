const fs = require('fs');

// ====================================================================
// FIX 1: Penalizaciones.jsx - Fix double-escaped regex and add dedup
// ====================================================================
let penCode = fs.readFileSync('src/pages/Penalizaciones.jsx', 'utf8');

// Fix 1a: The double-backslash regex bug in guardarEnBD
// Line 388: baseOrders map uses \\\\D instead of \\D
penCode = penCode.replace(
  "datosPenalizaciones.map(p => String(p.orden || '').replace(/\\\\D/g, '')).filter(Boolean))]",
  "datosPenalizaciones.map(p => String(p.orden || '').trim().toUpperCase()).filter(Boolean))]"
);

// Line 394: Query ventas using the full orden value (ID_GENERICO like 1228886964BAF), not just digits
// The old code strips digits and queries numero_orden with just numbers - but ventas stores the pure number
// We need to query by the numeric part but track the full ID for matching
penCode = penCode.replace(
  `const baseOrders = [...new Set(datosPenalizaciones.map(p => String(p.orden || '').trim().toUpperCase()).filter(Boolean))];
      const matchedVentasMap = {};
      const matchedVentasIds = [];

      for (let i = 0; i < baseOrders.length; i += 100) {
        const batch = baseOrders.slice(i, i + 100);
        const { data: vtas } = await supabase.from('ventas').select('id, numero_orden, producto, ejecutivo_id').in('numero_orden', batch);`,
  `// Extract unique numeric base orders for querying ventas table
      const numericOrders = [...new Set(datosPenalizaciones.map(p => {
        const raw = String(p.orden || '').trim();
        return raw.replace(/\\D/g, '');
      }).filter(Boolean))];
      const matchedVentasMap = {};
      const matchedVentasIds = [];

      for (let i = 0; i < numericOrders.length; i += 100) {
        const batch = numericOrders.slice(i, i + 100);
        const { data: vtas } = await supabase.from('ventas').select('id, numero_orden, producto, ejecutivo_id').in('numero_orden', batch);`
);

// Fix 1b: Fix the matching logic in guardarEnBD (line ~409, double backslash again)
penCode = penCode.replace(
  "const numOrden = rawOrden.replace(/\\\\D/g, '');",
  "const numOrden = rawOrden.replace(/\\D/g, '');"
);

// Fix 1c: Add deduplication BEFORE inserting - check existing penalizaciones by orden
const oldInsertBlock = `      // 5. Insertar en penalizaciones en lotes de 500
      const BATCH_SIZE = 500;
      let totalInsertados = 0;
      for (let i = 0; i < penalizacionesFinales.length; i += BATCH_SIZE) {
        const lote = penalizacionesFinales.slice(i, i + BATCH_SIZE);
        const { error: insertError } = await supabase.from('penalizaciones').insert(lote);
        if (insertError) throw new Error(\`Error en lote de inserción \${Math.floor(i / BATCH_SIZE) + 1}: \${insertError.message}\`);
        totalInsertados += lote.length;
      }`;

const newInsertBlock = `      // 5. Deduplicar: obtener penalizaciones existentes y filtrar las que ya están
      const ordenesExistentes = new Set();
      const { data: penExistentes } = await supabase.from('penalizaciones').select('orden, ejecutivo_id');
      if (penExistentes) {
        penExistentes.forEach(pe => {
          const key = String(pe.orden || '').trim().toUpperCase() + '|' + (pe.ejecutivo_id || '');
          ordenesExistentes.add(key);
        });
      }

      const penalizacionesSinDuplicados = penalizacionesFinales.filter(p => {
        const key = String(p.orden || '').trim().toUpperCase() + '|' + (p.ejecutivo_id || '');
        if (ordenesExistentes.has(key)) return false;
        ordenesExistentes.add(key); // Also prevent duplicates within the same upload
        return true;
      });

      // Insertar en lotes de 500
      const BATCH_SIZE = 500;
      let totalInsertados = 0;
      for (let i = 0; i < penalizacionesSinDuplicados.length; i += BATCH_SIZE) {
        const lote = penalizacionesSinDuplicados.slice(i, i + BATCH_SIZE);
        const { error: insertError } = await supabase.from('penalizaciones').insert(lote);
        if (insertError) throw new Error(\`Error en lote de inserción \${Math.floor(i / BATCH_SIZE) + 1}: \${insertError.message}\`);
        totalInsertados += lote.length;
      }
      
      const duplicadosOmitidos = penalizacionesFinales.length - penalizacionesSinDuplicados.length;`;

penCode = penCode.replace(oldInsertBlock, newInsertBlock);

// Update the success alert to mention duplicates
penCode = penCode.replace(
  "alert(`✅ Guardado exitoso: ${totalInsertados} registros de penalizaciones.${nuevosNombres.length > 0 ? `\\n👤 Ejecutivos nuevos integrados: ${nuevosNombres.join(', ')}` : ''}`);",
  "alert(`✅ Guardado exitoso: ${totalInsertados} registros de penalizaciones.${duplicadosOmitidos > 0 ? `\\n⚠️ ${duplicadosOmitidos} registros duplicados fueron omitidos.` : ''}${nuevosNombres.length > 0 ? `\\n👤 Ejecutivos nuevos integrados: ${nuevosNombres.join(', ')}` : ''}`);"
);

fs.writeFileSync('src/pages/Penalizaciones.jsx', penCode);
console.log('✅ Penalizaciones.jsx fixed (regex + dedup + matching)');


// ====================================================================
// FIX 2: AnalisisEjecutivo.jsx - Fix the matching logic to use ID_GENERICO exactly
// ====================================================================
let aeCode = fs.readFileSync('src/pages/AnalisisEjecutivo.jsx', 'utf8');

// Replace the entire matching block with a proper ID_GENERICO-based approach
const oldMatchingBlock = `    // Mapas para cruce de penalizaciones por N° de Orden (ignorando letras al final como BAF o TV)
    const penalizedOrdersGroup = {};
    penList.forEach(p => {
      const rawOrden = String(p.orden || '').trim().toUpperCase();
      const justDigits = rawOrden.replace(/\\D/g, ''); // Extract just numbers (e.g. 1252896493)
      const baseOrden = justDigits || rawOrden; // Fallback to raw if no digits
      
      const payload = { 
        rawOrden,
        periodo: p.periodo, 
        motivo: p.motivo_baja || p.tipo_penalizacion || 'Penalización General' 
      };
      
      if (!penalizedOrdersGroup[baseOrden]) penalizedOrdersGroup[baseOrden] = [];
      penalizedOrdersGroup[baseOrden].push(payload);
    });

    const ventasProcesadas = ventasBase.map(v => {
      const numOrdenRaw = String(v.numero_orden || '').trim().toUpperCase();
      const numOrden = numOrdenRaw.replace(/\\D/g, '') || numOrdenRaw;
      const productoAbrev = String(v.producto || '').split(' ')[0].trim().toUpperCase();
      
      let penData = null;
      const posiblesPens = penalizedOrdersGroup[numOrden];
      
      if (posiblesPens && posiblesPens.length > 0) {
        // Intenta coincidir exactamente, o que el ID_GENERICO incluya el producto (ej. 123456BAF incluye BAF)
        let matched = posiblesPens.find(p => p.rawOrden === numOrdenRaw || (p.rawOrden.startsWith(numOrden) && p.rawOrden.includes(productoAbrev)));
        
        if (matched) {
          penData = {
            periodo: matched.periodo,
            motivo: matched.motivo
          };
        }
      }

      const esPenalizadaPorArchivo = !!penData;
      
      const estadoUpper = (v.estado || '').toUpperCase();
      const esPenalizada = esPenalizadaPorArchivo || estadoUpper === 'PENALIZADA';
      
      return {
        ...v,
        esPenalizada,
        estado: esPenalizada ? 'PENALIZADA' : v.estado,
        mesPenalizacion: penData ? penData.periodo : null,
        motivoPenalizacion: penData ? penData.motivo : (esPenalizada ? estadoUpper : null)
      };
    });`;

const newMatchingBlock = `    // Mapa de penalizaciones por ID_GENERICO exacto (ej. "1228886964BAF")
    // El ID_GENERICO es el identificador ÚNICO e IRREPETIBLE de cada penalización
    const penByExactId = {};  // clave: ID_GENERICO completo (ej. "1228886964BAF")
    const penByNumOnly = {};  // fallback: solo dígitos (ej. "1228886964")
    const usedPenIds = new Set(); // Para evitar que una penalización se asigne a 2 ventas

    penList.forEach((p, idx) => {
      const rawOrden = String(p.orden || '').trim().toUpperCase();
      const payload = { 
        rawOrden,
        idx,
        periodo: p.periodo, 
        motivo: p.motivo_baja || p.tipo_penalizacion || 'Penalización General' 
      };
      
      // Indexar por ID_GENERICO exacto
      if (!penByExactId[rawOrden]) penByExactId[rawOrden] = [];
      penByExactId[rawOrden].push(payload);
      
      // Indexar también por solo dígitos como fallback
      const justDigits = rawOrden.replace(/\\D/g, '');
      if (justDigits) {
        if (!penByNumOnly[justDigits]) penByNumOnly[justDigits] = [];
        penByNumOnly[justDigits].push(payload);
      }
    });

    const ventasProcesadas = ventasBase.map(v => {
      const numOrdenRaw = String(v.numero_orden || '').trim().toUpperCase();
      
      let penData = null;
      
      // Estrategia 1: Buscar match exacto por ID_GENERICO
      // Construir el ID_GENERICO de la venta: numero_orden + primera palabra del producto
      // Ejemplo: venta con orden "1228886964" y producto "BAF 100MB" => "1228886964BAF"
      const productoAbrev = String(v.producto || '').split(' ')[0].trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const idGenericoVenta = numOrdenRaw + productoAbrev;
      
      // Intentar match exacto con el ID_GENERICO construido
      const exactMatches = penByExactId[idGenericoVenta];
      if (exactMatches && exactMatches.length > 0) {
        const unused = exactMatches.find(p => !usedPenIds.has(p.idx));
        if (unused) {
          usedPenIds.add(unused.idx);
          penData = { periodo: unused.periodo, motivo: unused.motivo };
        }
      }
      
      // Estrategia 2: Si no hay match exacto, intentar match por solo número
      // PERO solo si hay exactamente 1 penalización con ese número (para evitar ambigüedad)
      if (!penData) {
        const numOnly = numOrdenRaw.replace(/\\D/g, '') || numOrdenRaw;
        const numMatches = penByNumOnly[numOnly];
        if (numMatches && numMatches.length > 0) {
          // Buscar uno que no se haya usado aún y que su rawOrden coincida
          const unused = numMatches.find(p => !usedPenIds.has(p.idx) && (
            p.rawOrden === numOrdenRaw || 
            p.rawOrden === idGenericoVenta ||
            p.rawOrden.endsWith(productoAbrev)
          ));
          if (unused) {
            usedPenIds.add(unused.idx);
            penData = { periodo: unused.periodo, motivo: unused.motivo };
          }
        }
      }

      const esPenalizadaPorArchivo = !!penData;
      
      const estadoUpper = (v.estado || '').toUpperCase();
      const esPenalizada = esPenalizadaPorArchivo || estadoUpper === 'PENALIZADA';
      
      return {
        ...v,
        esPenalizada,
        estado: esPenalizada ? 'PENALIZADA' : v.estado,
        mesPenalizacion: penData ? penData.periodo : null,
        motivoPenalizacion: penData ? penData.motivo : (esPenalizada ? estadoUpper : null)
      };
    });`;

aeCode = aeCode.replace(oldMatchingBlock, newMatchingBlock);

fs.writeFileSync('src/pages/AnalisisEjecutivo.jsx', aeCode);
console.log('✅ AnalisisEjecutivo.jsx fixed (exact ID_GENERICO matching + no double-counting)');
