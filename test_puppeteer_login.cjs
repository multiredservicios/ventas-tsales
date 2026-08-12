const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Capturar errores
  page.on('pageerror', err => {
    console.log('CRASH DE REACT DETECTADO:', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLA ERROR:', msg.text());
    }
  });

  console.log('Navegando a Ejecutivos...');
  await page.goto('http://localhost:5173/ejecutivos', { waitUntil: 'networkidle0' });
  
  // Vamos a intentar loguearnos si hay login
  const isLogin = await page.$('input[type="email"]');
  if (isLogin) {
      console.log('Haciendo login...');
      await page.type('input[type="email"]', 'danilo@multired.cl'); // Dummy, no se si es esto
      // Actually if it requires login, we can't test it easily without creds.
  }

  await browser.close();
})();
