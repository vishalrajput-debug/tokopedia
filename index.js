const express = require("express");
const puppeteer = require("puppeteer-core");

const app = express();

app.get("/run", async (req, res) => {
  try {
    console.log("Opening page...");

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-http2",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-features=NetworkService",
        "--disable-features=NetworkServiceInProcess",
        "--window-size=1920,1080",
        "--disable-extensions",
        "--disable-features=IsolateOrigins,site-per-process"
      ]
    });

    const page = await browser.newPage();

    // Anti-headless detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9"
    });

    const url =
      "https://www.tokopedia.com/mybasicindonesia/mybasic-boxy-crop-t-shirt-kaos-boxy-fit-with-cotton-combed-24s-dengan-200-gsm-1730148724140508744?aff_unique_id=VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D&channel=salinlink&source=TTS&utm_source=salinlink&utm_medium=affiliate-share&utm_campaign=affiliateshare-pdp-VjgEBL2zYnXL9eFz0aWzIN1oSniFGHGALE1N5Mw8U16eHJBvAjrak6GGqx_hX6eSBcZLIwS6BZD6PKurTuTXMdU5vNkJafm6WA%3D%3D-1730148724140508744-0-041125&scene=pdp&chain_key=%7B%22t%22%3A1%2C%22k%22%3A%22000000000000000007568802845060974343%22%2C%22sc%22%3A%22salinlink%22%7D";

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    console.log("Page loaded!");

    await page.waitForSelector("[data-testid='PDPImageThumbnail']", {
      timeout: 15000
    });

    await page.click("[data-testid='PDPImageThumbnail']");
    console.log("Clicked thumbnail!");

    await browser.close();

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, error: err.message });
  }
});

app.listen(10000, () => console.log("Server running on port 10000"));
