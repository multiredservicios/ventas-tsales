const fs = require('fs');
let code = fs.readFileSync('src/pages/AnalisisEjecutivo.jsx', 'utf8');

// 1. Remove Button (simpler regex)
code = code.replace(/<button[^>]*onClick=\{\(\) => setModalPenAbierto\(true\)\}[^>]*>[\s\S]*?<\/button>/, '');

// 2. Extract sections using exact regex splits
function splitAt(str, delim) {
  const parts = str.split(delim);
  if (parts.length < 2) throw new Error('Not found: ' + delim);
  return [parts[0], parts.slice(1).join(delim)];
}

let remaining = code;
let part;

[part, remaining] = splitAt(remaining, '{listaVentas.length > 0 && (\n        <div style={{ backgroundColor: \'white\', padding: \'20px\'');
const topPart = part;

[part, remaining] = splitAt(remaining, '{/* GRÁFICO DE MES DE ORIGEN DE VENTA (VENTAS Y PENALIZADAS) */}');
const ventanaBlock = '{listaVentas.length > 0 && (\n        <div style={{ backgroundColor: \'white\', padding: \'20px\'' + part;

[part, remaining] = splitAt(remaining, '{/* SECCIÓN DETALLE REGISTRO DE PENALIZACIONES IMPORTADAS */}');
const graficoBlock = '{/* GRÁFICO DE MES DE ORIGEN DE VENTA (VENTAS Y PENALIZADAS) */}' + part;

[part, remaining] = splitAt(remaining, '{/* TABLA DE HISTORIA DE VENTAS */}');
const importadasBlock = '{/* SECCIÓN DETALLE REGISTRO DE PENALIZACIONES IMPORTADAS */}' + part;

[part, remaining] = splitAt(remaining, '{/* ══════════════════════════════════════\n          Modal: Detalle Penalizaciones\n      ══════════════════════════════════════ */}');
const historiaBlock = '{/* TABLA DE HISTORIA DE VENTAS */}' + part;

// remaining is now the modal block + the end of the file.
// We need to split the end of the file.
[part, remaining] = splitAt(remaining, '</div>\n  );\n}');
let modalBlock = '{/* ══════════════════════════════════════\n          Modal: Detalle Penalizaciones\n      ══════════════════════════════════════ */}' + part;
const endFileBlock = '</div>\n  );\n}' + remaining;

// Transform the modalBlock
modalBlock = modalBlock.replace('{/* ══════════════════════════════════════\n          Modal: Detalle Penalizaciones\n      ══════════════════════════════════════ */}', '{/* DETALLE DE PENALIZACIONES ABIERTO */}');
modalBlock = modalBlock.replace(/\{modalPenAbierto && penData && \([\s\S]*?onClick=\{\(e\) => \{ if \(e\.target === e\.currentTarget\) setModalPenAbierto\(false\); \}\}>/, '{penData && (\n        <div style={{ backgroundColor: \'white\', borderRadius: \'8px\', padding: \'20px\', marginBottom: \'20px\', boxShadow: \'0 2px 4px rgba(0,0,0,0.1)\' }}>\n          <div>');
modalBlock = modalBlock.replace(/<button[^>]*onClick=\{\(\) => setModalPenAbierto\(false\)\}[^>]*>[\s\S]*?<\/button>/, '');

// Clean up closing braces
modalBlock = modalBlock.replace(/\n          <\/div>\n        <\/div>\n      \)\}/, '\n        </div>\n      )}');

// Reorder
const newOrder = topPart + graficoBlock + ventanaBlock + importadasBlock + modalBlock + historiaBlock + endFileBlock;

fs.writeFileSync('src/pages/AnalisisEjecutivo.jsx', newOrder);
console.log('Done!');
