const express = require("express");
const puppeteer = require("puppeteer-core");
const path = require("path");

const app = express();

app.get("/run", async (req, res) => {
  try {
    console.log("Opening page...");

    // Render chromium path
    const chromiumPath =
      process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium";

    const browser = await puppeteer.launch({
      headless: "shell", // better than true on Render
      executablePath: chromiumPath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-http2",
        "--no-zygote",
        "--single-process",
        "--disable-features=IsolateOrigins,site-per-process",
        "--window-size=1400,2000"
      ]
    });

    const page = await browser.newPage();

    // Avoid Tokopedia bot-blocking
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/123.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "accept-language": "id-ID,id;q=0.9"
    });

    await page.setViewport({ width: 1400, height: 2000 });

    // Product URL
    const URL =
      "https://www.tokopedia.com/mybasicindonesia/mybasic-boxy-crop-t-shirt-kaos-boxy-fit-with-cotton-combed-24s-dengan-200-gsm-1730148724140508744?aff_unique_id=VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D&channel=salinlink&utm_source=salinlink";

    console.log("Loading page...");
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    console.log("Page loaded!");

    // ======================================================
    //   IMPROVED VIDEO THUMBNAIL HANDLING (Multiple fallback)
    // ======================================================

    const selectors = [
      "button[data-testid='PDPImageThumbnail'] .playIcon",
      "button[data-testid='PDPImageThumbnail'] img[src*='play']",
      "div[data-testid='PDPImageThumbnail'] img[src*='play']",
      "img[src*='play']",
      "button[aria-label='Putar Video']"
    ];

    console.log("Looking for video thumbnail...");

    let foundSelector = null;

    for (const sel of selectors) {
      try {
        await page.waitForSelector(sel, { timeout: 3000 });
        foundSelector = sel;
        break;
      } catch (_) {}
    }

    if (!foundSelector) {
      throw new Error("❌ Video thumbnail not found on Render");
    }

    console.log("Video thumbnail found:", foundSelector);

    await page.click(foundSelector);
    console.log("Video clicked!");

    console.log("Waiting for video to start...");
    await new Promise((r) => setTimeout(r, 4000));

    // Wait for video tag
    await page.waitForSelector("video", { timeout: 15000 });
    console.log("Video element detected!");

    // Take screenshot
    const screenshotPath = path.join(__dirname, "video-frame.png");

    await page.screenshot({
      path: screenshotPath,
      type: "png",
      fullPage: false
    });

    console.log("Screenshot captured:", screenshotPath);

    await browser.close();

    return res.json({
      success: true,
      screenshot: "video-frame.png"
    });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, error: err.message });
  }
});

app.listen(10000, () => console.log("Server running on port 10000"));
