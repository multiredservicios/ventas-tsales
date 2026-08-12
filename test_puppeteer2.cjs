const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173/ejecutivos', {waitUntil: 'domcontentloaded'});
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking link...');
  await page.click('a[href^="/ejecutivos/GRUPO-"]');
  
  await new Promise(r => setTimeout(r, 3000));
  console.log('Done waiting after click');
  await browser.close();
})();
