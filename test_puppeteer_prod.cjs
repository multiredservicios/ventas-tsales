const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('CRASH DE REACT:', err.message);
  });
  
  await page.goto('http://localhost:5000/ejecutivos/GRUPO-CONTRATADO', { waitUntil: 'networkidle0' });
  const body = await page.evaluate(() => document.body.innerHTML);
  console.log('Body HTML length:', body.length);
  if (body.includes('Cargando perfil y ventas')) {
     console.log('Renders cargando');
  } else if (body.includes('Ejecutivo no encontrado')) {
     console.log('Renders not found');
  } else if (body.includes('Análisis de Ventas')) {
     console.log('Renders Dashboard');
  } else if (body.includes('login-container')) {
     console.log('Renders Login');
  } else {
     console.log('Blank screen or unknown state:', body.substring(0, 500));
  }
  
  await browser.close();
})();
