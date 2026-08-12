const fs = require('fs');
let code = fs.readFileSync('src/pages/AnalisisEjecutivo.jsx', 'utf8');

// Helper to extract a block of code
function extractBlock(startMarker, endMarker) {
  const start = code.indexOf(startMarker);
  if (start === -1) throw new Error('Not found: ' + startMarker);
  let end;
  if (endMarker) {
    end = code.indexOf(endMarker, start);
    if (end === -1) throw new Error('Not found end: ' + endMarker);
  } else {
    end = code.length;
  }
  const block = code.substring(start, end);
  code = code.substring(0, start) + code.substring(end);
  return block;
}

// 1. Remove the button
const buttonRegex = /<button[^>]*onClick=\{\(\) => setModalPenAbierto\(true\)\}[^>]*>[\s\S]*?<\/button>/;
code = code.replace(buttonRegex, '');

// 2. Extract blocks in reverse order of their current appearance
const endOfFileStr = '</div>\n  );\n}';
const modalStartStr = '{/* ══════════════════════════════════════\n          Modal: Detalle Penalizaciones\n      ══════════════════════════════════════ */}';
const modalBlock = extractBlock(modalStartStr, endOfFileStr);

const historiaStartStr = '{/* TABLA DE HISTORIA DE VENTAS */}';
const historiaBlock = extractBlock(historiaStartStr);

const importadasStartStr = '{/* SECCIÓN DETALLE REGISTRO DE PENALIZACIONES IMPORTADAS */}';
const importadasBlock = extractBlock(importadasStartStr);

const graficoOrigenStartStr = '{/* GRÁFICO DE MES DE ORIGEN DE VENTA (VENTAS Y PENALIZADAS) */}';
const graficoOrigenBlock = extractBlock(graficoOrigenStartStr);

const ventanaStartStr = '{listaVentas.length > 0 && (\n        <div style={{ backgroundColor: \'white\'';
const ventanaBlock = extractBlock(ventanaStartStr);

// 3. Process the modal block to remove the modal wrappers
let unmodaledBlock = modalBlock.replace(modalStartStr, '{/* DETALLE DE PENALIZACIONES (ABIERTO) */}');

const modalWrapperStart = '{modalPenAbierto && penData && (\n        <div style={{\n          position: \'fixed\', top: 0, left: 0, right: 0, bottom: 0,\n          backgroundColor: \'rgba(15, 23, 42, 0.75)\', backdropFilter: \'blur(4px)\',\n          display: \'flex\', alignItems: \'center\', justifyContent: \'center\', zIndex: 9999, padding: \'20px\'\n        }} onClick={(e) => { if (e.target === e.currentTarget) setModalPenAbierto(false); }}>\n          <div style={{\n            backgroundColor: \'white\', borderRadius: \'16px\', width: \'100%\', maxWidth: \'1200px\',\n            maxHeight: \'90vh\', display: \'flex\', flexDirection: \'column\',\n            boxShadow: \'0 25px 50px -12px rgba(0, 0, 0, 0.25)\', overflow: \'hidden\'\n          }}>';
unmodaledBlock = unmodaledBlock.replace(modalWrapperStart, '{penData && (\n<div style={{ backgroundColor: \'white\', borderRadius: \'8px\', padding: \'20px\', marginBottom: \'20px\', boxShadow: \'0 2px 4px rgba(0,0,0,0.1)\' }}>');

// Remove the close button from the header
unmodaledBlock = unmodaledBlock.replace(/<button[^>]*onClick=\{\(\) => setModalPenAbierto\(false\)\}[^>]*>[\s\S]*?<\/button>/, '');

// Clean up the ending braces of the modal (replace the last closing divs and paren)
const lastDivs = '\n          </div>\n        </div>\n      )}';
unmodaledBlock = unmodaledBlock.replace(lastDivs, '\n</div>\n)}');

// 4. Now insert them back in the new order
// New order: graficoOrigen -> ventana -> importadas -> unmodaled -> historia
const newOrder = graficoOrigenBlock + ventanaBlock + importadasBlock + unmodaledBlock + historiaBlock;

// Put the new order back where we cut it out (right before endOfFileStr)
code = code.replace(endOfFileStr, newOrder + endOfFileStr);

fs.writeFileSync('src/pages/AnalisisEjecutivo.jsx', code);
console.log('Reordered AnalisisEjecutivo.jsx successfully!');
