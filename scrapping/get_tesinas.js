const puppeteer = require("puppeteer");
const fs = require("fs");

const filtros = [
  "Accesibilidad",
  "Web-based+services",
  "Android",
  "Algorithms",
  "Software",
];

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ Referer: "https://www.google.com/" });

  let allTesinas = [];

  for (const filtro of filtros) {
    console.log(`Scrapeando filtro: ${filtro}`);
    const baseUrl =
      `https://sedici.unlp.edu.ar/handle/10915/36/discover?rpp=10&etal=0&group_by=none` +
      `&filtertype_0=type&filter_relational_operator_0=equals&filter_0=Tesis+de+grado` +
      `&filtertype=keywords&filter_relational_operator=equals&filter=${filtro}`;

    let pageNum = 1;

    while (true) {
      const url = `${baseUrl}&page=${pageNum}`;
      await page.goto(url, { waitUntil: "networkidle2" });

      try {
        await page.waitForSelector("li.ds-artifact-item", { timeout: 8000 });
      } catch {
        console.log(`No más tesinas para ${filtro} en página ${pageNum}.`);
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

      if (tesinas.length === 0) break;

      tesinas.forEach((t) => (t.filtro = filtro));
      allTesinas = allTesinas.concat(tesinas);
      console.log(
        `Página ${pageNum} (${filtro}) scrapeada: ${tesinas.length} tesinas.`
      );
      pageNum++;
    }
  }

  fs.writeFileSync(
    "tesinas_filtradas.json",
    JSON.stringify(allTesinas, null, 2)
  );
  console.log(`Total tesinas guardadas: ${allTesinas.length}`);

  await browser.close();
})();
