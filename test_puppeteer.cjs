const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:5173/ejecutivos', {waitUntil: 'networkidle2'});
  await page.waitForSelector('a[href^="/ejecutivos/GRUPO-"]');
  await page.click('a[href^="/ejecutivos/GRUPO-"]');
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
