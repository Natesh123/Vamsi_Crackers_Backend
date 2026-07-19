const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 1000));
  
  try {
    const isLogin = await page.$('input[placeholder="Enter admin username"]');
    if (isLogin) {
      await page.type('input[placeholder="Enter admin username"]', 'admin');
      await page.type('input[placeholder="Enter account password"]', 'admin123');
      await page.click('button[type="submit"]');
      await new Promise(r => setTimeout(r, 3000));
      await page.screenshot({ path: '/home/amazing/Desktop/crackers_city/app/puppeteer_dashboard.png' });
      console.log("Logged in and took screenshot.");
    } else {
      console.log("Login form not found. Took screenshot.");
      await page.screenshot({ path: '/home/amazing/Desktop/crackers_city/app/puppeteer_error.png' });
    }
  } catch(e) {
    console.log("Script error: " + e.message);
  }
  
  await browser.close();
})();
