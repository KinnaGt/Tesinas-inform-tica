document.addEventListener("DOMContentLoaded", function () {
  const includes = document.querySelectorAll("[data-include-html]");

  // Convertimos el forEach en una lista de promesas
  const promises = Array.from(includes).map(async (el) => {
    const file = el.getAttribute("data-include-html");
    try {
      const resp = await fetch(file);
      if (resp.ok) {
        el.innerHTML = await resp.text();
        if (file.includes("top_bar.html")) {
          setupAccessibilityMenu();
        }
      } else {
        el.innerHTML = "No se pudo cargar " + file;
      }
    } catch (err) {
      el.innerHTML = "Error al cargar " + file;
    }
  });

  // Una vez que se cargaron todos los includes
  Promise.all(promises).then(() => {
    loadTesinas();

    // Botón de preguntar: simular respuesta
    const askBtn = document.getElementById("askButton");
    const input = document.getElementById("questionInput");
    const output = document.getElementById("answerOutput");

    if (askBtn && input && output) {
      askBtn.addEventListener("click", () => {
        const value = input.value.trim();
        output.textContent = value
          ? "Gracias por tu pregunta. Un asesor académico te responderá a la brevedad."
          : "Por favor escribí una pregunta.";
      });
    }

    // Agregar listeners a los botones de filtro
    document.querySelectorAll(".btn-filter").forEach((btn) =>
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".btn-filter")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;
        document.querySelectorAll(".tesina-item").forEach((item) => {
          const match = filter === "all" || item.dataset.category === filter;
          item.style.display = match ? "block" : "none";
        });
      })
    );
  });
});

function setupAccessibilityMenu() {
  const settingsBtn = document.getElementById("acc-settings-btn");
  const menu = document.getElementById("acc-menu");
  const fontButtons = document.querySelectorAll(".font-btn");

  if (!settingsBtn || !menu || !fontButtons.length) return;

  settingsBtn.addEventListener("click", () => {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  window.setFontSize = function (size) {
    const html = document.documentElement;
    html.classList.remove("font-small", "font-medium", "font-large");
    html.classList.add(`font-${size}`);

    // Remover estado activo
    fontButtons.forEach((btn) => btn.classList.remove("active-btn"));

    // Activar botón correspondiente
    document
      .querySelector(`.font-btn[onclick="setFontSize('${size}')"]`)
      ?.classList.add("active-btn");

    menu.style.display = "none";
  };
  setFontSize("medium");

  const darkBtn = document.getElementById("dark-theme-btn");
  const lightBtn = document.getElementById("light-theme-btn");

  function setTheme(theme) {
    const html = document.documentElement;
    html.classList.remove("theme-dark", "theme-light");
    html.classList.add(`theme-${theme}`);

    // Actualiza el fondo elíptico
    document
      .querySelectorAll(".theme-wrapper")
      .forEach((w) => w.classList.remove("active-theme"));
    if (theme === "dark") {
      document.getElementById("dark-wrapper").classList.add("active-theme");
    } else {
      document.getElementById("light-wrapper").classList.add("active-theme");
    }
    updateThemeImages(theme); // Actualiza la imagen según el tema
  }

  darkBtn.classList.add("theme-icon");
  lightBtn.classList.add("theme-icon");

  darkBtn.addEventListener("click", () => setTheme("dark"));
  lightBtn.addEventListener("click", () => setTheme("light"));

  // Tema por defecto
  setTheme("dark");
}

function loadTesinas() {
  const container = document.getElementById("tesinas-carousel");
  if (!container) return;

  const DEFAULT_BANNER = "img/default_banner.png";

  fetch("data/tesinas.json")
    .then((res) => res.json())
    .then((tesinas) => {
      tesinas.forEach((tesina) => {
        const banner = tesina.bannerUrl?.trim() || DEFAULT_BANNER;
        const categoria = tesina.categoria?.trim() || "Other";

        const col = document.createElement("div");
        col.className = "tesina-item";
        col.setAttribute("data-category", categoria);

        col.innerHTML = `
  <a href="detail_tesina.html?nombre=${encodeURIComponent(
    tesina.nombre
  )}" class="text-decoration-none">
    <div class="card card-theme border-0 h-100 shadow-sm">
      <img src="${banner}" class="card-img-top" alt="Banner ilustrativo para la tesina ${
          tesina.nombre
        } realizada por ${tesina.autor}">
      <div class="card-body">
        <h3 class="card-title">${tesina.nombre}</h3>
        <p class="card-text">${tesina.autor || ""}</p>
      </div>
    </div>
  </a>
`;
        container.appendChild(col);
      });

      document.querySelectorAll(".btn-filter").forEach((btn) =>
        btn.addEventListener("click", () => {
          document
            .querySelectorAll(".btn-filter")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          const filter = btn.dataset.filter;
          const items = document.querySelectorAll(".tesina-item");
          let visibleCount = 0;

          items.forEach((item) => {
            const match = filter === "all" || item.dataset.category === filter;
            item.style.display = match ? "block" : "none";
            if (match) visibleCount++;
          });

          // Mostrar mensaje si no hay coincidencias
          const container = document.getElementById("tesinas-carousel");
          let msg = document.getElementById("no-tesinas-msg");

          if (!msg) {
            msg = document.createElement("div");
            msg.id = "no-tesinas-msg";
            msg.className = "";
            container.appendChild(msg);
          }

          msg.textContent =
            visibleCount === 0 ? "No hay tesinas para este filtro." : "";
        })
      );

      document
        .querySelectorAll("#tesinas-carousel img, #tesinas-carousel a")
        .forEach((el) => {
          el.setAttribute("draggable", "false");
          el.style.userSelect = "none";
          el.style.webkitUserDrag = "none";
          el.addEventListener("dragstart", (e) => e.preventDefault());
        });

      enableDragScroll(document.querySelector("#tesinas-carousel"));
    });
}

function enableDragScroll(container) {
  let isDown = false;
  let startX;
  let scrollLeft;

  container.addEventListener("mousedown", (e) => {
    isDown = true;
    container.classList.add("dragging");
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("mouseleave", () => {
    isDown = false;
    container.classList.remove("dragging");
  });

  container.addEventListener("mouseup", () => {
    isDown = false;
    container.classList.remove("dragging");
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 0.5;
    container.scrollLeft = scrollLeft - walk;
  });
}

function updateThemeImages(theme) {
  const whatImg = document.getElementById("whatImg");
  if (whatImg) {
    whatImg.src = theme === "dark" ? "img/what_is_dark.png" : "img/what_is.png";
  }
  const questionImg = document.getElementById("questionImg");
  if (questionImg) {
    questionImg.src =
      theme === "dark" ? "img/questions_dark.png" : "img/questions.png";
  }
}
