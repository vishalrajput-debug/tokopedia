const puppeteer = require('puppeteer');

// Helper: simple delay
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Tokopedia product URL
const URL =
  "https://www.tokopedia.com/mybasicindonesia/mybasic-boxy-crop-t-shirt-kaos-boxy-fit-with-cotton-combed-24s-dengan-200-gsm-1730148724140508744?aff_unique_id=VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D&channel=salinlink&source=TTS&utm_source=salinlink&utm_medium=affiliate-share&utm_campaign=affiliateshare-pdp-VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D-1730148724140508744-0-041125&scene=pdp&chain_key=%7B%22t%22%3A1%2C%22k%22%3A%22000000000000000007568802845060974343%22%2C%22sc%22%3A%22salinlink%22%7D";

async function openAndPlayVideo() {
  console.log("🚀 Launching browser...");

  // Detect Render environment
  const isRender = !!process.env.RENDER;
  
  // Puppeteer launch config
  const browser = await puppeteer.launch({
    headless: isRender ? true : false, // headless only on server
    executablePath: isRender
      ? '/opt/render/.cache/puppeteer/chrome/linux-142.0.7444.61/chrome-linux64/chrome'
      : undefined,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--ignore-certificate-errors',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-http2', // fixes ERR_HTTP2_PROTOCOL_ERROR
      '--disable-web-security',
      '--start-maximized',
    ]
  });

  const page = await browser.newPage();

  try {
    console.log(`🌐 Navigating to: ${URL}`);
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });

    console.log("⏳ Waiting for thumbnails to load...");
    await page.waitForSelector('[data-testid="PDPImageThumbnail"]', { timeout: 30000 });

    // Count and click thumbnails
    const count = await page.$$eval('[data-testid="PDPImageThumbnail"]', els => els.length);
    console.log(`🖼️ Found ${count} thumbnail buttons.`);

    console.log("🎥 Clicking the video thumbnail (second button)...");
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('[data-testid="PDPImageThumbnail"]');
      if (buttons.length > 1) {
        buttons[1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        buttons[1].click();
      }
    });

    console.log("⏳ Waiting for video player...");
    await delay(5000);

    const videoExists = await page.evaluate(() => !!document.querySelector('video'));
    if (videoExists) {
      console.log("🎬 Video player detected and should be playing now!");
    } else {
      console.log("⚠️ No <video> tag found — may be in iframe/modal.");
    }

  } catch (err) {
    console.error("💥 Error during automation:", err.message);
  } finally {
    console.log("🕐 Keeping browser open for 10 seconds before closing...");
    await delay(10000);
    await browser.close();
    console.log("✅ Done!");
  }
}

openAndPlayVideo().catch(err => {
  console.error("💥 Fatal error:", err);
});
