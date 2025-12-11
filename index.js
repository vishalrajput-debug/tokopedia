const express = require("express");
const puppeteer = require("puppeteer-core");
const path = require("path");

const app = express();

app.get("/run", async (req, res) => {
  try {
    console.log("Opening page...");

    const browser = await puppeteer.launch({
      headless: "shell",
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
        "--window-size=1400,2000"
      ]
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    );

    await page.setViewport({ width: 1400, height: 2000 });

    const URL = "https://www.tokopedia.com/mybasicindonesia/mybasic-boxy-crop-t-shirt-kaos-boxy-fit-with-cotton-combed-24s-dengan-200-gsm-1730148724140508744?aff_unique_id=VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D&channel=salinlink&source=TTS&utm_source=salinlink&utm_medium=affiliate-share&utm_campaign=affiliateshare-pdp-VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D-1730148724140508744-0-041125&scene=pdp&chain_key=%7B%22t%22%3A1%2C%22k%22%3A%22000000000000000007568802845060974343%22%2C%22sc%22%3A%22salinlink%22%7D";

    console.log("Loading page...");
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 90000 });
    console.log("Page loaded!");

    const selectors = [
      "button[data-testid='PDPImageThumbnail'] img.playIcon",
      "button[data-testid='PDPImageThumbnail'] .playIcon",
      "img.playIcon",
      "img[src*='play']"
    ];

    console.log("Looking for video thumbnail...");

    let found = null;

    for (const s of selectors) {
      try {
        await page.waitForSelector(s, { timeout: 5000 });
        found = s;
        break;
      } catch (_) {}
    }

    if (!found) {
      throw new Error("❌ Video thumbnail not found");
    }

    console.log("Found video thumbnail:", found);

    await page.evaluate(sel => {
      const el = document.querySelector(sel);
      if (el) el.closest("button").click();
    }, found);

    console.log("Video clicked!");

    await page.waitForSelector("video", { timeout: 15000 });

    const screenshotPath = path.join(__dirname, "video-frame.png");
    await page.screenshot({ path: screenshotPath });

    await browser.close();
    return res.json({ success: true, screenshot: "video-frame.png" });
    

  } catch (err) {
    console.error(err);
    return res.json({ success: false, error: err.message });
  }
});


app.listen(10000, () => console.log("Server running on port 10000"));
