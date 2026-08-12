const fs = require('fs');
let code = fs.readFileSync('src/pages/AnalisisEjecutivo.jsx', 'utf8');

const str1 = '{/* SECCIÓN DETALLE REGISTRO DE PENALIZACIONES IMPORTADAS */}';
const str2 = '{/* ══════════════════════════════════════\n          Detalle Penalizaciones (Abierto)\n      ══════════════════════════════════════ */}';
const str3 = '{/* TABLA DE HISTORIA DE VENTAS */}';

const i1 = code.indexOf(str1);
const i2 = code.indexOf(str2);
const i3 = code.indexOf(str3);

const p1 = code.substring(0, i1);
const block1 = code.substring(i1, i2);
const block2 = code.substring(i2, i3);
const p3 = code.substring(i3);

fs.writeFileSync('src/pages/AnalisisEjecutivo.jsx', p1 + block2 + block1 + p3);
console.log('Swapped block1 and block2!');
