const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({ 
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[CONSOLE ERROR] ${msg.text()}`);
  });
  page.on('pageerror', error => {
    errors.push("[PAGEERROR] " + error.message);
  });
  
  console.log("Navigating to admin...");
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  
  // Login first
  try {
    const isLogin = await page.$('input[placeholder="Enter admin username"]');
    if (isLogin) {
      console.log("Logging in...");
      await page.type('input[placeholder="Enter admin username"]', 'admin');
      await page.type('input[placeholder="Enter account password"]', 'admin123');
      await page.click('button[type="submit"]');
      await new Promise(r => setTimeout(r, 4000));
    }
    
    console.log("Reloading page...");
    await page.reload({ waitUntil: 'networkidle2' });
    console.log("Reloaded.");
    
    const text = await page.evaluate(() => document.body.innerText);
    console.log("PAGE TEXT:", text.substring(0, 500));
    await page.screenshot({ path: '/home/amazing/Desktop/crackers_city/app/puppeteer_reload.png' });
    console.log("Screenshot taken.");
    
  } catch(e) {
    errors.push("Script error: " + e.message);
  }
  
  console.log("ERRORS_FOUND:\n", errors.join('\n'));
  await browser.close();
})();
