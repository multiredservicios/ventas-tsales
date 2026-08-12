const fs = require('fs');
let code = fs.readFileSync('src/pages/AnalisisEjecutivo.jsx', 'utf8');

const effectRegex = /\s*\/\/\s*Reset pagination on filter change\s*useEffect\(\(\) => \{\s*setPaginaHist\(1\);\s*\}, \[fHistEstado, fHistMes, fHistProducto, fHistTipo, fHistCliente, fHistFecha\]\);/g;

code = code.replace(effectRegex, '');

const effectCode = `
  // Reset pagination on filter change
  useEffect(() => {
    setPaginaHist(1);
  }, [fHistEstado, fHistMes, fHistProducto, fHistTipo, fHistCliente, fHistFecha]);
`;

const insertTarget = "if (cargando) return <h2 style={{ padding: '20px' }}>Cargando perfil y ventas...</h2>;";
code = code.replace(insertTarget, effectCode + '\n  ' + insertTarget);

fs.writeFileSync('src/pages/AnalisisEjecutivo.jsx', code);
console.log('Moved useEffect successfully!');
