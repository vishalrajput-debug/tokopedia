const puppeteer = require('puppeteer');

// Small delay helper
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Tokopedia product URL
const URL = "https://www.tokopedia.com/mybasicindonesia/mybasic-boxy-crop-t-shirt-kaos-boxy-fit-with-cotton-combed-24s-dengan-200-gsm-1730148724140508744?aff_unique_id=VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D&channel=salinlink&source=TTS&utm_source=salinlink&utm_medium=affiliate-share&utm_campaign=affiliateshare-pdp-VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D-1730148724140508744-0-041125&scene=pdp&chain_key=%7B%22t%22%3A1%2C%22k%22%3A%22000000000000000007568802845060974343%22%2C%22sc%22%3A%22salinlink%22%7D";

async function openAndPlayVideo() {
  console.log("🚀 Launching browser...");
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"]
  });
  const page = await browser.newPage();

  try {
    console.log(`🌐 Navigating to: ${URL}`);
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });

    console.log("⏳ Waiting for thumbnails to load...");
    await page.waitForSelector('[data-testid="PDPImageThumbnail"]', { timeout: 30000 });

    // Debug: count thumbnails
    const count = await page.$$eval('[data-testid="PDPImageThumbnail"]', els => els.length);
    console.log(`🖼️ Found ${count} thumbnail buttons.`);

    // Click the 2nd button (index 1), which is the video
    console.log("🎥 Clicking the video thumbnail (second button)...");
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('[data-testid="PDPImageThumbnail"]');
      if (buttons.length > 1) {
        buttons[1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        buttons[1].click();
      }
    });

    // Wait for video player to appear
    console.log("⏳ Waiting for the video player to load...");
    await delay(4000);

    // Check if video element exists
    const videoExists = await page.evaluate(() => !!document.querySelector('video'));
    if (videoExists) {
      console.log("🎬 Video player detected and should be playing now!");
    } else {
      console.log("⚠️ Video tag not found — it might be inside an iframe or modal.");
    }

  } catch (err) {
    console.error("💥 Error during automation:", err.message);
  } finally {
    console.log("🕐 Keeping browser open for 8 seconds before closing...");
    await delay(8000);
    await browser.close();
    console.log("✅ Done!");
  }
}

openAndPlayVideo();
