const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({ 
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    errors.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });
  page.on('pageerror', error => {
    errors.push("[PAGEERROR] " + error.message);
  });
  
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  try {
    const isLogin = await page.$('input[placeholder="Enter admin username"]');
    if (isLogin) {
      await page.type('input[placeholder="Enter admin username"]', 'admin');
      await page.type('input[placeholder="Enter account password"]', 'admin123');
      await page.click('button[type="submit"]');
      await new Promise(r => setTimeout(r, 4000));
    } else {
      errors.push("Login form not found. Page content: " + await page.content());
    }
  } catch(e) {
    errors.push("Script error: " + e.message);
  }
  
  console.log("ERRORS_FOUND:\n", errors.join('\n'));
  await browser.close();
})();
