const fs = require('fs');
let code = fs.readFileSync('src/pages/AnalisisEjecutivo.jsx', 'utf8');

const strVentanas = '{/* TABLAS DE PENALIZACIONES POR VENTANA DE TIEMPO (AGRUPADAS POR MES DE ORIGEN DE VENTA) */}';
const strImportadas = '{/* SECCIÓN DETALLE REGISTRO DE PENALIZACIONES IMPORTADAS */}';
const strHistoria = '{/* TABLA DE HISTORIA DE VENTAS */}';
const strModal = '{/* ══════════════════════════════════════\n          Detalle Penalizaciones (Abierto)\n      ══════════════════════════════════════ */}';
const strEnd = '    </div>\n  );\n}';

const iVentanas = code.indexOf(strVentanas);
const iImportadas = code.indexOf(strImportadas);
const iHistoria = code.indexOf(strHistoria);
const iModal = code.indexOf(strModal);
const iEnd = code.lastIndexOf(strEnd);

const part1 = code.substring(0, iVentanas);
const blockVentanas = code.substring(iVentanas, iImportadas);
const blockImportadas = code.substring(iImportadas, iHistoria);
const blockHistoria = code.substring(iHistoria, iModal);
const blockModal = code.substring(iModal, iEnd);
const partEnd = code.substring(iEnd);

// New order: Ventanas -> Modal -> Importadas -> Historia
const finalCode = part1 + blockVentanas + blockModal + blockImportadas + blockHistoria + partEnd;

fs.writeFileSync('src/pages/AnalisisEjecutivo.jsx', finalCode);
console.log('Reordered safely!');
