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

// Mueve el setup acá
function setupAccessibilityMenu() {
  const settingsBtn = document.getElementById('acc-settings-btn');
  const menu = document.getElementById('acc-menu');

  if (!settingsBtn || !menu) return;

  settingsBtn.addEventListener('click', () => {
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  });

  window.setFontSize = function(size) {
    const html = document.documentElement;
    html.classList.remove('font-small', 'font-medium', 'font-large');
    html.classList.add(`font-${size}`);
    menu.style.display = 'none';
  };
}
