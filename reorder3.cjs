const fs = require('fs');
let code = fs.readFileSync('src/pages/AnalisisEjecutivo.jsx', 'utf8');

const strGrafico = '{/* GRÁFICO DE MES DE ORIGEN DE VENTA (VENTAS Y PENALIZADAS) */}';
const strVentanas = '{/* TABLAS DE PENALIZACIONES POR VENTANA DE TIEMPO (AGRUPADAS POR MES DE ORIGEN DE VENTA) */}';
const strImportadas = '{/* SECCIÓN DETALLE REGISTRO DE PENALIZACIONES IMPORTADAS */}';
const strModal = '{/* ══════════════════════════════════════\n          Detalle Penalizaciones (Abierto)\n      ══════════════════════════════════════ */}';
const strHistoria = '{/* TABLA DE HISTORIA DE VENTAS */}';

const iGrafico = code.indexOf(strGrafico);
const iVentanas = code.indexOf(strVentanas);
const iImportadas = code.indexOf(strImportadas);
const iModal = code.indexOf(strModal);
const iHistoria = code.indexOf(strHistoria);

// We know the current order is: Grafico -> Ventanas -> Importadas -> Modal -> Historia
// Let's verify by just sorting the indices.
let indices = [
  { name: 'Grafico', idx: iGrafico },
  { name: 'Ventanas', idx: iVentanas },
  { name: 'Importadas', idx: iImportadas },
  { name: 'Modal', idx: iModal },
  { name: 'Historia', idx: iHistoria },
  { name: 'End', idx: code.indexOf('    </div>\n  );\n}\n\nexport default') }
];
indices.sort((a, b) => a.idx - b.idx);

const blocks = {};
for (let i = 0; i < indices.length - 1; i++) {
  blocks[indices[i].name] = code.substring(indices[i].idx, indices[i+1].idx);
}

const part1 = code.substring(0, indices[0].idx);
const partEnd = code.substring(indices[indices.length - 1].idx);

// Desired order: Grafico -> Ventanas -> Modal -> Importadas -> Historia
const newCode = part1 + blocks['Grafico'] + blocks['Ventanas'] + blocks['Modal'] + blocks['Importadas'] + blocks['Historia'] + partEnd;

fs.writeFileSync('src/pages/AnalisisEjecutivo.jsx', newCode);
console.log('Reordered safely!');
