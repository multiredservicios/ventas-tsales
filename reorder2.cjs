const fs = require('fs');
let code = fs.readFileSync('src/pages/AnalisisEjecutivo.jsx', 'utf8');

const iGrafico = code.indexOf('{/* GRÁFICO DE MES DE ORIGEN DE VENTA (VENTAS Y PENALIZADAS) */}');
const iVentanas = code.indexOf('{/* TABLAS DE PENALIZACIONES POR VENTANA DE TIEMPO');
const iImportadas = code.indexOf('{/* SECCIÓN DETALLE REGISTRO DE PENALIZACIONES IMPORTADAS */}');
const iModal = code.indexOf('{/* ══════════════════════════════════════\n          Detalle Penalizaciones (Abierto)\n      ══════════════════════════════════════ */}');
const iHistoria = code.indexOf('{/* TABLA DE HISTORIA DE VENTAS */}');
const iEnd = code.lastIndexOf('</div>\n  );\n}');

const part1 = code.slice(0, iGrafico);
const blockGrafico = code.slice(iGrafico, iVentanas);
const blockVentanas = code.slice(iVentanas, iImportadas);
const blockImportadas = code.slice(iImportadas, iModal);
const blockModal = code.slice(iModal, iHistoria);
const blockHistoria = code.slice(iHistoria, iEnd);
const partEnd = code.slice(iEnd);

// New order: grafico -> ventanas -> modal -> importadas -> historia
const finalCode = part1 + blockGrafico + blockVentanas + blockModal + blockImportadas + blockHistoria + partEnd;

fs.writeFileSync('src/pages/AnalisisEjecutivo.jsx', finalCode);
console.log('Reordered using slice!');
