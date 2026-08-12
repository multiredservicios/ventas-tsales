const fs = require('fs');
let code = fs.readFileSync('src/pages/AnalisisEjecutivo.jsx', 'utf8');

// Use regex to find indices regardless of \r\n
const rImportadas = /\{\/\* SECCIÓN DETALLE REGISTRO DE PENALIZACIONES IMPORTADAS \*\/\}/;
const rModal = /\{\/\* ══════════════════════════════════════\r?\n\s*Detalle Penalizaciones \(Abierto\)\r?\n\s*══════════════════════════════════════ \*\/\}/;
const rModalEnd = /      \)\}\r?\n    <\/div>\r?\n  \);\r?\n\}/;

const matchImportadas = code.match(rImportadas);
const matchModal = code.match(rModal);
const matchModalEnd = code.match(rModalEnd);

if (!matchImportadas || !matchModal || !matchModalEnd) {
  console.log('Failed to match!');
  if (!matchImportadas) console.log('Missing Importadas');
  if (!matchModal) console.log('Missing Modal');
  if (!matchModalEnd) console.log('Missing ModalEnd');
  process.exit(1);
}

const idxImportadas = matchImportadas.index;
const idxModal = matchModal.index;
const idxModalEnd = matchModalEnd.index + matchModalEnd[0].indexOf('    </div>');

console.log('idxImportadas:', idxImportadas);
console.log('idxModal:', idxModal);
console.log('idxModalEnd:', idxModalEnd);

// chunk1: Importadas + Historia (from idxImportadas to idxModal)
const chunk1 = code.substring(idxImportadas, idxModal);
// chunk2: Modal (from idxModal to idxModalEnd)
const chunk2 = code.substring(idxModal, idxModalEnd);

const p1 = code.substring(0, idxImportadas);
const pEnd = code.substring(idxModalEnd);

// New order: p1 + chunk2 + chunk1 + pEnd
const newCode = p1 + chunk2 + chunk1 + pEnd;

fs.writeFileSync('src/pages/AnalisisEjecutivo.jsx', newCode);
console.log('Swapped successfully with regex!');
