const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    Referer: "https://www.google.com/",
  });

  const baseUrl =
    "https://sedici.unlp.edu.ar/handle/10915/36/discover?rpp=10&etal=0&group_by=none&filtertype_0=type&filter_relational_operator_0=equals&filter_0=Tesis+de+grado";

  let allTesinas = [];
  let pageNum = 1;

  while (true) {
    const url = `${baseUrl}&page=${pageNum}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    try {
      await page.waitForSelector("li.ds-artifact-item", { timeout: 8000 });
    } catch {
      console.log(
        `No se encontraron tesinas en página ${pageNum}, terminando.`
      );
      break;
    }

    const tesinas = await page.evaluate(() => {
      const data = [];
      document.querySelectorAll("li.ds-artifact-item").forEach((el) => {
        const titleEl = el.querySelector("div.artifact-title a");
        const authorsEl = el.querySelector("div.author span");
        const dateEl = el.querySelector(
          "div.artifact-type div.publisher-date span"
        );
        const originEl = el.querySelector(
          "div.artifact-type div.originInfo span"
        );

        data.push({
          title: titleEl?.textContent.trim() || null,
          link: titleEl
            ? "https://sedici.unlp.edu.ar" + titleEl.getAttribute("href")
            : null,
          authors: authorsEl?.textContent.trim() || null,
          date: dateEl?.textContent.trim() || null,
          origin: originEl?.textContent.trim() || null,
        });
      });
      return data;
    });

    if (tesinas.length === 0) {
      console.log(`No hay más tesinas en página ${pageNum}.`);
      break;
    }

    allTesinas = allTesinas.concat(tesinas);
    console.log(
      `Página ${pageNum} scrapeada, tesinas encontradas: ${tesinas.length}`
    );
    pageNum++;
  }

  fs.writeFileSync("tesinas_todas.json", JSON.stringify(allTesinas, null, 2));
  console.log(`Total tesinas guardadas: ${allTesinas.length}`);

  await browser.close();
})();
