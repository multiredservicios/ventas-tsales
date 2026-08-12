const fs = require('fs');
let code = fs.readFileSync('src/pages/AnalisisEjecutivo.jsx', 'utf8');

const iVentanas = code.indexOf('{/* TABLAS DE PENALIZACIONES POR VENTANA DE TIEMPO');
const iGrafico = code.indexOf('{/* GRÁFICO DE MES DE ORIGEN DE VENTA (VENTAS Y PENALIZADAS) */}');
const iImportadas = code.indexOf('{/* SECCIÓN DETALLE REGISTRO DE PENALIZACIONES IMPORTADAS */}');
const iHistoria = code.indexOf('{/* TABLA DE HISTORIA DE VENTAS */}');
const iModal = code.indexOf('{/* ══════════════════════════════════════\n          Modal: Detalle Penalizaciones\n      ══════════════════════════════════════ */}');
const iEnd = code.lastIndexOf('</div>\n  );\n}');

const part1 = code.slice(0, iVentanas);
const blockVentanas = code.slice(iVentanas, iGrafico);
const blockGrafico = code.slice(iGrafico, iImportadas);
const blockImportadas = code.slice(iImportadas, iHistoria);
const blockHistoria = code.slice(iHistoria, iModal);
const blockModal = code.slice(iModal, iEnd);
const partEnd = code.slice(iEnd);

// Modify modal block
let newModal = blockModal;
// Remove modal wrappers
newModal = newModal.replace('{modalPenAbierto && penData && (\n        <div style={{\n          position: \'fixed\', top: 0, left: 0, right: 0, bottom: 0,\n          backgroundColor: \'rgba(15, 23, 42, 0.75)\', backdropFilter: \'blur(4px)\',\n          display: \'flex\', alignItems: \'center\', justifyContent: \'center\', zIndex: 9999, padding: \'20px\'\n        }} onClick={(e) => { if (e.target === e.currentTarget) setModalPenAbierto(false); }}>\n          <div style={{\n            backgroundColor: \'white\', borderRadius: \'16px\', width: \'100%\', maxWidth: \'1200px\',\n            maxHeight: \'90vh\', display: \'flex\', flexDirection: \'column\',\n            boxShadow: \'0 25px 50px -12px rgba(0, 0, 0, 0.25)\', overflow: \'hidden\'\n          }}>', '{penData && (\n        <div style={{ backgroundColor: \'white\', borderRadius: \'8px\', padding: \'20px\', marginBottom: \'20px\', boxShadow: \'0 2px 4px rgba(0,0,0,0.1)\' }}>');
// Remove close button
newModal = newModal.replace(/<button[^>]*onClick=\{\(\) => setModalPenAbierto\(false\)\}[^>]*>[\s\S]*?<\/button>/, '');
// Replace header comment
newModal = newModal.replace('{/* ══════════════════════════════════════\n          Modal: Detalle Penalizaciones\n      ══════════════════════════════════════ */}', '{/* DETALLE DE PENALIZACIONES ABIERTO */}');
// Clean up ending tags
newModal = newModal.replace('\n          </div>\n        </div>\n      )}', '\n        </div>\n      )}');

// Reorder
const finalCode = part1 + blockGrafico + blockVentanas + blockImportadas + newModal + blockHistoria + partEnd;

fs.writeFileSync('src/pages/AnalisisEjecutivo.jsx', finalCode);
console.log('Reordered using slice!');
