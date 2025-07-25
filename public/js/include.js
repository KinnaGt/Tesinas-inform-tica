// js/include.js
document.addEventListener("DOMContentLoaded", function () {
  const includes = document.querySelectorAll("[data-include-html]");

  if (includes.length === 0) {
    loadTesinas();
    const savedTheme = localStorage.getItem("theme") || "dark";
    updateThemeImages(savedTheme);
    window.scrollTo(0, 0);
    return;
  }

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

  Promise.all(promises).then(() => {
    loadTesinas(); // Carga las tesinas

    // Lógica de filtros de tesinas
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

    const savedTheme = localStorage.getItem("theme") || "dark";
    updateThemeImages(savedTheme);

    window.scrollTo(0, 0);
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
    localStorage.setItem("fontSize", size); // ← Guarda selección

    fontButtons.forEach((btn) => btn.classList.remove("active-btn"));
    document
      .querySelector(`.font-btn[onclick="setFontSize('${size}')"]`)
      ?.classList.add("active-btn");

    menu.style.display = "none";
  };

  const savedFontSize = localStorage.getItem("fontSize") || "medium";
  setFontSize(savedFontSize);

  const darkBtn = document.getElementById("dark-theme-btn");
  const lightBtn = document.getElementById("light-theme-btn");

  function setTheme(theme) {
    const html = document.documentElement;
    html.classList.remove("theme-dark", "theme-light");
    html.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);

    document
      .querySelectorAll(".theme-wrapper")
      .forEach((w) => w.classList.remove("active-theme"));
    if (theme === "dark") {
      document.getElementById("dark-wrapper").classList.add("active-theme");
    } else {
      document.getElementById("light-wrapper").classList.add("active-theme");
    }
    updateThemeImages(theme);
  }

  darkBtn.classList.add("theme-icon");
  lightBtn.classList.add("theme-icon");

  darkBtn.addEventListener("click", () => setTheme("dark"));
  lightBtn.addEventListener("click", () => setTheme("light"));

  // Agregado para activación con teclado (Enter y Space)
  darkBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setTheme("dark");
    }
  });

  lightBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setTheme("light");
    }
  });
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.classList.add(`theme-${savedTheme}`);

  // Marcar el wrapper activo
  document
    .querySelectorAll(".theme-wrapper")
    .forEach((w) => w.classList.remove("active-theme"));
  const activeWrapper = document.getElementById(`${savedTheme}-wrapper`);
  if (activeWrapper) activeWrapper.classList.add("active-theme");
}

function loadTesinas() {
  const container = document.getElementById("tesinas-carousel");
  if (!container) return;

  const banners = {
    UX: "img/ux.svg",
    Web: "img/web.svg",
    Android: "img/android.svg",
    Algorithms: "img/algorithms.svg",
  };

  fetch("data/tesinas.json")
    .then((res) => res.json())
    .then((tesinas) => {
      tesinas.forEach((tesina) => {
        const filter = tesina.filter?.trim() || "Other";
        const banner = banners[filter];

        const col = document.createElement("div");
        col.className = "tesina-item";
        col.setAttribute("data-category", filter);

        col.innerHTML = `
                    <a href="detail_tesina.html?nombre=${encodeURIComponent(
                      tesina.title
                    )}" class="text-decoration-none">
                        <div class="card card-theme border-0 h-100 shadow-sm">
                            <img src="${banner}" class="card-img-top" alt="Imagen ilustrativa de la categoria ${
          tesina.filter
        } realizada por ${tesina.authors}">
                            <div class="card-body">
                                <h3 class="card-title">${tesina.title}</h3>
                                <p class="card-text">${tesina.authors || ""}</p>
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

          let msg = document.getElementById("no-tesinas-msg");
          if (!msg) {
            msg = document.createElement("div");
            msg.id = "no-tesinas-msg";
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
