function initChatbot() {
  let tesinas = [];

  fetch("data/tesinas.json")
    .then((res) => res.json())
    .then((data) => (tesinas = data));

  const askButton = document.getElementById("askButton");
  const questionInput = document.getElementById("questionInput");
  const answerOutput = document.getElementById("answerOutput");

  if (!askButton || !questionInput || !answerOutput) return;

  askButton.addEventListener("click", () => {
    const input = questionInput.value.trim().toLowerCase();

    if (!input) {
      answerOutput.textContent = "Por favor escribí una pregunta.";
      return;
    }

    const match = tesinas.find((t) => t.nombre?.toLowerCase().includes(input));

    if (match) {
      answerOutput.textContent = `La tesina "${
        match.nombre
      }" fue realizada por ${match.autor || "autor desconocido"}. ${
        match.descripcion || "Sin descripción disponible."
      }`;
      return;
    }

    const categoria = tesinas.find(
      (t) => t.categoria && input.includes(t.categoria.toLowerCase())
    );

    if (categoria) {
      answerOutput.textContent = `Hay una tesina sobre ${
        categoria.categoria
      }: "${categoria.nombre}" por ${categoria.autor || "autor desconocido"}.`;
      return;
    }

    answerOutput.textContent =
      "No encontré una respuesta relacionada. Probá reformular la pregunta.";
  });
}
