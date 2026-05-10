
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const scrapeAmazonBrandPage = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    const url = "https://www.amazon.com/Glucomart/b/ref=bl_dp_s_web_87855460011?ie=UTF8&node=87855460011&field-lbr_brands_browse-bin=Glucomart";

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('div.s-main-slot');

    const products = await page.evaluate(() => {
      const productNodes = document.querySelectorAll('div.s-main-slot > div[data-component-type="s-search-result"]');
      const scraped = [];

      productNodes.forEach(product => {
        const titleEl = product.querySelector('h2 span');
        const priceEl = product.querySelector('.a-price .a-offscreen');
        const imageEl = product.querySelector('img.s-image');
        const linkEl = product.querySelector('h2 a');

        const title = titleEl?.innerText || 'No title';
        const price = priceEl?.innerText || 'Price unavailable';
        const image = imageEl?.src || '';
        const rawHref = linkEl?.getAttribute('href') || '';

        const link = asinMatch
        ? `https://www.amazon.com/dp/${asinMatch[1]}`
        : rawHref.startsWith('/')
          ? `https://www.amazon.com${rawHref}`
          : '#';
      

        scraped.push({ title, price, image, link });
      });

      return scraped;
    });

    console.log("✅ Scraped products:", products);

    const outputPath = path.join(__dirname, 'public', 'products.json');
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));

    console.log("📝 Products saved to public/products.json");

    await browser.close();
  } catch (error) {
    console.error("❌ Scraping failed:", error.message);
  }
};

scrapeAmazonBrandPage(); 






