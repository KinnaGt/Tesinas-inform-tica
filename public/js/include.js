// Carga archivos HTML en los divs con include-html
document.addEventListener("DOMContentLoaded", function () {
  const includes = document.querySelectorAll("[include-html]");

  includes.forEach(async (el) => {
    const file = el.getAttribute("include-html");
    try {
      const resp = await fetch(file);
      if (resp.ok) {
        el.innerHTML = await resp.text();
      } else {
        el.innerHTML = "No se pudo cargar " + file;
      }
    } catch (err) {
      el.innerHTML = "Error al cargar " + file;
    }
  });
});
