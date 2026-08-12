const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// We need to parse supabaseClient.js to get URL and KEY
const supabaseContent = fs.readFileSync('c:\\Users\\T-Sales\\Desktop\\Ventas-tsales\\ventas-tsales\\src\\supabaseClient.js', 'utf8');
const urlMatch = supabaseContent.match(/supabaseUrl = '([^']+)'/);
const keyMatch = supabaseContent.match(/supabaseKey = '([^']+)'/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function test() {
  const { data: execs } = await supabase.from('ejecutivos').select('*');
  console.log('Total ejecutivos:', execs.length);

  const freelanceEmpresa = execs.filter(e => e.tipo_contrato === 'FREELANCE EMPRESA');
  console.log('Freelance Empresa ejecutivos:', freelanceEmpresa.length);
  const feIds = freelanceEmpresa.map(e => e.id);

  const { data: allVentas } = await supabase.from('ventas').select('id, ejecutivo_id');
  console.log('Total ventas fetch sin limite aparente:', allVentas.length);

  const ventasFE = allVentas.filter(v => feIds.includes(v.ejecutivo_id));
  console.log('Ventas pertenecientes a Freelance Empresa:', ventasFE.length);

  const { data: inVentas } = await supabase.from('ventas').select('id, ejecutivo_id').in('ejecutivo_id', feIds);
  console.log('Ventas usando .in() para Freelance Empresa:', inVentas ? inVentas.length : 0);
  
  const contratados = execs.filter(e => e.tipo_contrato !== 'FREELANCE' && e.tipo_contrato !== 'FREELANCE EMPRESA');
  const cIds = contratados.map(e => e.id);
  const { data: inVentasC } = await supabase.from('ventas').select('id, ejecutivo_id').in('ejecutivo_id', cIds);
  console.log('Ventas usando .in() para Contratados:', inVentasC ? inVentasC.length : 0);
}

test();
