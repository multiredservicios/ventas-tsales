const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/ejecutivos/GRUPO-CONTRATADO', {waitUntil: 'networkidle0'});
  const body = await page.evaluate(() => document.body.innerHTML);
  console.log(body.substring(0, 500));
  await browser.close();
})();
