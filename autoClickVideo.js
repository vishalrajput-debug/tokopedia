const puppeteer = require('puppeteer');

// Small delay helper
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Tokopedia product URL
const URL = "https://www.tokopedia.com/mybasicindonesia/mybasic-boxy-crop-t-shirt-kaos-boxy-fit-with-cotton-combed-24s-dengan-200-gsm-1730148724140508744?aff_unique_id=VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D&channel=salinlink&source=TTS&utm_source=salinlink&utm_medium=affiliate-share&utm_campaign=affiliateshare-pdp-VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D-1730148724140508744-0-041125&scene=pdp&chain_key=%7B%22t%22%3A1%2C%22k%22%3A%22000000000000000007568802845060974343%22%2C%22sc%22%3A%22salinlink%22%7D";

async function openAndPlayVideo() {
  console.log("🚀 Launching browser...");
  // Note: These arguments are good for running headless in constrained environments like Render/Docker.
  const browser = await puppeteer.launch({
    headless: "new", // Use 'new' headless mode
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu"
    ]
  });

  const page = await browser.newPage();

  try {
    console.log(`🌐 Navigating to: ${URL}`);
    // Increase timeout slightly for better robustness on e-commerce sites
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 120000 });

    console.log("⏳ Waiting for thumbnails to load...");
    // Use a more specific selector if possible, but this data-testid seems robust
    await page.waitForSelector('[data-testid="PDPImageThumbnail"]', { timeout: 30000 });

    const count = await page.$$eval('[data-testid="PDPImageThumbnail"]', els => els.length);
    console.log(`🖼️ Found ${count} thumbnail buttons.`);

    console.log("🎥 Clicking the video thumbnail (second button)...");
    // Using page.evaluate() is efficient for clicking elements found client-side
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('[data-testid="PDPImageThumbnail"]');
      if (buttons.length > 1) {
        // Ensure element is visible before clicking
        buttons[1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        buttons[1].click();
      } else {
        console.warn("Could not find the second thumbnail button for the video.");
      }
    });

    console.log("⏳ Waiting for the video player to load...");
    // Adding a short wait for dynamic content to initialize
    await delay(4000);

    const videoExists = await page.evaluate(() => !!document.querySelector('video'));
    if (videoExists) {
      console.log("🎬 Video player detected and should be playing now!");
      // Optionally, you could capture a screenshot here to confirm the video is playing
    } else {
      console.log("⚠️ Video tag not found — it might be inside an iframe or modal.");
      // You could add logic here to check for common video wrappers or iframes
    }

  } catch (err) {
    console.error("💥 Error during automation:", err.message);
  } finally {
    // Keeping the browser open is good for debugging, but in production, you'd close immediately
    console.log("🕐 Keeping browser open for 40 seconds before closing...");
    await delay(40000);
    await browser.close();
    console.log("✅ Done!");
  }
}

openAndPlayVideo();