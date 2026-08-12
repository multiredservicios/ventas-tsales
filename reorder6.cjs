const fs = require('fs');
let code = fs.readFileSync('src/pages/AnalisisEjecutivo.jsx', 'utf8');

const sVentanas = '{/* TABLAS DE PENALIZACIONES POR VENTANA DE TIEMPO (AGRUPADAS POR MES DE ORIGEN DE VENTA) */}';
const sImportadas = '{/* SECCIÓN DETALLE REGISTRO DE PENALIZACIONES IMPORTADAS */}';
const sModal = '{/* ══════════════════════════════════════\n          Detalle Penalizaciones (Abierto)\n      ══════════════════════════════════════ */}';
const sHistoria = '{/* TABLA DE HISTORIA DE VENTAS */}';

const iVentanas = code.indexOf(sVentanas);
const iImportadas = code.indexOf(sImportadas);
const iModal = code.indexOf(sModal);
const iHistoria = code.indexOf(sHistoria);

if (iVentanas === -1 || iImportadas === -1 || iModal === -1 || iHistoria === -1) {
  throw new Error('Could not find all anchors');
}

console.log('Ventanas:', iVentanas);
console.log('Importadas:', iImportadas);
console.log('Modal:', iModal);
console.log('Historia:', iHistoria);

// We know the actual order in file is currently:
// 1. Ventanas (after Graficos) - wait, currently Graficos is BEFORE Ventanas
// The order is: iVentanas -> iImportadas -> iModal -> iHistoria

const p1 = code.substring(0, iVentanas);
const bVentanas = code.substring(iVentanas, iImportadas);
const bImportadas = code.substring(iImportadas, iModal);
const bModal = code.substring(iModal, iHistoria);
const pEnd = code.substring(iHistoria);

const finalCode = p1 + bVentanas + bModal + bImportadas + pEnd;

fs.writeFileSync('src/pages/AnalisisEjecutivo.jsx', finalCode);
console.log('Swapped correctly!');
