document.addEventListener("DOMContentLoaded", function () {
  const includes = document.querySelectorAll("[include-html]");

  includes.forEach(async (el) => {
    const file = el.getAttribute("include-html");
    try {
      const resp = await fetch(file);
      if (resp.ok) {
        el.innerHTML = await resp.text();
        if (file.includes("top_bar.html")) {
          setupAccessibilityMenu(); // ⬅️ Llamar al setup después de insertar
        }
      } else {
        el.innerHTML = "No se pudo cargar " + file;
      }
    } catch (err) {
      el.innerHTML = "Error al cargar " + file;
    }
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
  }

  darkBtn.classList.add("theme-icon");
  lightBtn.classList.add("theme-icon");

  darkBtn.addEventListener("click", () => setTheme("dark"));
  lightBtn.addEventListener("click", () => setTheme("light"));

  // Tema por defecto
  setTheme("dark");
}
