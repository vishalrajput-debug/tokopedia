const fs = require('fs');
const path = require('path');

// Use puppeteer-core for Render (external Chrome)
let puppeteer;
let executablePath;

if (process.env.RENDER) {
  // 🟢 Running on Render — use chromium
  puppeteer = require('puppeteer-core');
  const chromium = require('chromium');
  executablePath = chromium.path || '/usr/bin/chromium-browser';
  console.log("☁️ Running on Render. Using Chromium from:", executablePath);
} else {
  // 💻 Running locally — use full Puppeteer (includes Chrome)
  puppeteer = require('puppeteer');
  executablePath = puppeteer.executablePath();
  console.log("💻 Running locally. Using Puppeteer's built-in Chrome at:", executablePath);
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));

const URL =
  "https://www.tokopedia.com/mybasicindonesia/mybasic-boxy-crop-t-shirt-kaos-boxy-fit-with-cotton-combed-24s-dengan-200-gsm-1730148724140508744?aff_unique_id=VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D&channel=salinlink&source=TTS&utm_source=salinlink&utm_medium=affiliate-share&utm_campaign=affiliateshare-pdp-VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D-1730148724140508744-0-041125&scene=pdp&chain_key=%7B%22t%22%3A1%2C%22k%22%3A%22000000000000000007568802845060974343%22%2C%22sc%22%3A%22salinlink%22%7D";

async function openAndPlayVideo() {
  console.log("🚀 Launching browser...");

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    timeout: 60000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-http2',
      '--ignore-certificate-errors',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
      '--window-size=1920,1080'
    ],
  });

  const page = await browser.newPage();

  try {
    console.log(`🌐 Navigating to: ${URL}`);
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });

    console.log("⏳ Waiting for thumbnails...");
    await page.waitForSelector('[data-testid="PDPImageThumbnail"]', { timeout: 30000 });

    const count = await page.$$eval('[data-testid="PDPImageThumbnail"]', els => els.length);
    console.log(`🖼️ Found ${count} thumbnails.`);

    console.log("🎥 Clicking the video thumbnail...");
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('[data-testid="PDPImageThumbnail"]');
      if (buttons.length > 1) {
        buttons[1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        buttons[1].click();
      }
    });

    console.log("⏳ Waiting for video to appear...");
    await delay(5000);

    const videoExists = await page.evaluate(() => !!document.querySelector('video'));
    if (videoExists) console.log("🎬 Video player detected!");
    else console.log("⚠️ Video not found (might be in iframe/modal).");

  } catch (err) {
    console.error("💥 Error:", err.message);
  } finally {
    console.log("🕐 Closing browser in 10 seconds...");
    await delay(10000);
    await browser.close();
    console.log("✅ Done!");
  }
}

openAndPlayVideo().catch(err => {
  console.error("💥 Fatal error:", err);
});
