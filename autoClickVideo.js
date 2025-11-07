/**
 * Tokopedia Puppeteer Automation — Render + Local Compatible
 * Author: Vishal Rajput
 */

const path = require('path');
const fs = require('fs');

// 🧠 Use puppeteer-extra + stealth plugin for anti-bot bypass
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteerExtra.use(StealthPlugin());

let executablePath;
let usingRender = false;

if (process.env.RENDER) {
  // ☁️ Running on Render
  const chromium = require('chromium');
  executablePath = chromium.path || '/usr/bin/chromium-browser';
  usingRender = true;
  console.log("☁️ Running on Render. Using Chromium from:", executablePath);
} else {
  // 💻 Running locally
  const puppeteer = require('puppeteer');
  executablePath = puppeteer.executablePath();
  console.log("💻 Running locally. Using Puppeteer's built-in Chrome at:", executablePath);
}

// Helper: simple delay
const delay = (ms) => new Promise(r => setTimeout(r, ms));

const URL =
  "https://www.tokopedia.com/mybasicindonesia/mybasic-boxy-crop-t-shirt-kaos-boxy-fit-with-cotton-combed-24s-dengan-200-gsm-1730148724140508744?aff_unique_id=VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D&channel=salinlink&source=TTS&utm_source=salinlink&utm_medium=affiliate-share&utm_campaign=affiliateshare-pdp-VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D-1730148724140508744-0-041125&scene=pdp";

async function openAndPlayVideo() {
  console.log("🚀 Launching browser...");

  const browser = await puppeteerExtra.launch({
    headless: true,
    executablePath,
    timeout: 60000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--ignore-certificate-errors',
      '--disable-http2',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
      '--window-size=1920,1080',
      '--single-process',
      '--no-zygote'
    ],
  });

  const page = await browser.newPage();

  try {
    console.log(`🌐 Navigating to: ${URL}`);
    await page.goto(URL, {
      waitUntil: ['domcontentloaded', 'networkidle2'],
      timeout: 180000,
    });

    console.log("⏳ Waiting for thumbnails...");
    await page.waitForSelector('[data-testid="PDPImageThumbnail"]', { timeout: 40000 });

    const count = await page.$$eval('[data-testid="PDPImageThumbnail"]', els => els.length);
    console.log(`🖼️ Found ${count} thumbnails.`);

    if (count > 1) {
      console.log("🎥 Clicking the video thumbnail...");
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('[data-testid="PDPImageThumbnail"]');
        if (buttons.length > 1) {
          buttons[1].scrollIntoView({ behavior: 'smooth', block: 'center' });
          buttons[1].click();
        }
      });

      console.log("⏳ Waiting for video element...");
      await delay(8000);

      const videoExists = await page.evaluate(() => !!document.querySelector('video'));
      console.log(videoExists ? "🎬 Video player detected!" : "⚠️ Video not found.");
    } else {
      console.log("⚠️ No video thumbnail found.");
    }
  } catch (err) {
    console.error("💥 Error:", err.message);
  } finally {
    console.log("🕐 Closing browser in 10 seconds...");
    await delay(10000);
    await browser.close();
    console.log("✅ Done!");
  }
}

openAndPlayVideo().catch((err) => {
  console.error("💥 Fatal error:", err);
});
