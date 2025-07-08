const puppeteer = require("puppeteer");
const fs = require("fs");

//PONER JSON DE DONDE CARGAR LA INFO A BUSCAR
const jsonData = require("../public/data/tesinas.json");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const enrichedData = [];

  for (const item of jsonData) {
    try {
      await page.goto(item.link, { waitUntil: "domcontentloaded" });

      // Esperar a que haya algún bloque de descripción
      await page.waitForSelector(".simple-item-view-description", {
        timeout: 5000,
      });

      const resumen = await page.evaluate(() => {
        const blocks = Array.from(
          document.querySelectorAll(".simple-item-view-description")
        );
        for (const block of blocks) {
          const h2 = block.querySelector("h2");
          if (h2 && h2.textContent.trim().toLowerCase() === "resumen") {
            const p = block.querySelector("p");
            return p ? p.innerText.trim() : "";
          }
        }
        return "";
      });

      if (!resumen) {
        console.log(`No se encontró resumen para: ${item.title}`);
      } else {
        console.log(`OK: ${item.title}`);
      }

      enrichedData.push({
        ...item,
        resumen,
      });
    } catch (e) {
      console.error(`ERROR: ${item.title} - ${e.message}`);
    }
  }

  await browser.close();
  fs.writeFileSync("data_enriched.json", JSON.stringify(enrichedData, null, 2));
})();
