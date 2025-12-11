const express = require("express");
const puppeteer = require("puppeteer-core");
const path = require("path");

const app = express();

app.get("/run", async (req, res) => {
  try {
    console.log("Opening page...");

    // Render Docker chromium path
    const chromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium";

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: chromiumPath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-http2",
        "--single-process",
        "--no-zygote",
        "--disable-features=IsolateOrigins,site-per-process"
      ]
    });

    const page = await browser.newPage();

    // Fake browser
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/123.0.0.0 Safari/537.36"
    );

    await page.setViewport({ width: 1280, height: 800 });

    // Product URL
    const URL =
      "https://www.tokopedia.com/mybasicindonesia/mybasic-boxy-crop-t-shirt-kaos-boxy-fit-with-cotton-combed-24s-dengan-200-gsm-1730148724140508744?aff_unique_id=VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D&channel=salinlink&source=TTS&utm_source=salinlink&utm_medium=affiliate-share&utm_campaign=affiliateshare-pdp-VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D-1730148724140508744-0-041125&scene=pdp&chain_key=%7B%22t%22%3A1%2C%22k%22%3A%22000000000000000007568802845060974343%22%2C%22sc%22%3A%22salinlink%22%7D";

    console.log("Loading page...");
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    console.log("Page loaded!");

    // ============= VIDEO THUMBNAIL SECTION =============
    const videoThumbSelector =
      "button[data-testid='PDPImageThumbnail'] .playIcon";

    console.log("Looking for video thumbnail...");
    await page.waitForSelector(videoThumbSelector, { timeout: 20000 });

    console.log("Video thumbnail found! Clicking...");
    await page.evaluate(() => {
      const playIcon = document.querySelector(
        "button[data-testid='PDPImageThumbnail'] .playIcon"
      );
      if (playIcon) playIcon.closest("button").click();
    });

    console.log("Video clicked!");
    console.log("Waiting for video to start...");

    await new Promise((r) => setTimeout(r, 3000));

    await page.waitForSelector("video", { timeout: 15000 });

    console.log("Video element found!");

    // Take screenshot
    const screenshotPath = path.join(__dirname, "video-frame.png");
    await page.screenshot({ path: screenshotPath, type: "png" });

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
