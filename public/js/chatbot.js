// js/chatbot.js

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => {
    if (typeof BotUI === "undefined") {
      console.error(
        "Error: BotUI no está definido. Asegúrate de que botui.min.js se ha cargado correctamente en tu HTML ANTES de chatbot.js."
      );
      return;
    }

    const botuiAppElement = document.getElementById("botui-app");
    const startChatbotBtn = document.getElementById("startChatbotBtn");
    const tesinaDesc = document.getElementById("tesinaDesc");
    if (!botuiAppElement || !startChatbotBtn) {
      console.error(
        "Error: Elementos del chatbot (botui-app o startChatbotBtn) no encontrados en el DOM."
      );
      return;
    }

    let botui;
    let chatHistory = [];
    let tesinasData = [];

    // Función para cargar el JSON de tesinas
    async function loadTesinasData() {
      try {
        const response = await fetch("data/tesinas.json");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, text: ${errorText}`
          );
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error al cargar los datos de tesinas:", error);
        return [];
      }
    }

    // Función para cargar el JSON de preguntas y respuestas frecuentes
    async function loadKnowledgeBase() {
      try {
        const response = await fetch("data/frequent_questions.json");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, text: ${errorText}`
          );
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error al cargar la base de conocimiento:", error);
        return [];
      }
    }

    // Función para buscar una respuesta en la base de conocimiento JSON
    function findAnswerInKnowledgeBase(question, knowledgeBase) {
      const lowerCaseQuestion = question.toLowerCase();
      for (const entry of knowledgeBase) {
        const keywords = entry.keywords.map((kw) => kw.toLowerCase());
        for (const keyword of keywords) {
          if (lowerCaseQuestion.includes(keyword)) {
            return entry.answer;
          }
        }
      }
      return null;
    }

    // Función para llamar al modelo de lenguaje (LLM)
    async function callLLM(prompt, tesinasInfo) {
      try {
        const relevantTesinas = tesinasInfo.slice(0, 10).map((tesina) => ({
          title: tesina.title,
          authors: tesina.authors,
          date: tesina.date,
          filter: tesina.filter,
          resume: tesina.resume,
        }));

        const tesinasContext =
          relevantTesinas.length > 0
            ? `Aquí tienes información sobre algunas tesinas disponibles: ${JSON.stringify(
                relevantTesinas
              )}`
            : "No hay información de tesinas disponible para consultar.";

        chatHistory.push({
          role: "user",
          parts: [
            { text: `${prompt}\n\nContexto de tesinas: ${tesinasContext}` },
          ],
        });

        const payload = {
          contents: chatHistory,
          generationConfig: {
            maxOutputTokens: 150,
          },
        };

        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(
            "Error al llamar al LLM (response.ok es false):",
            errorData
          );
          throw new Error(
            `LLM API error! status: ${
              response.status
            }, message: ${JSON.stringify(errorData)}`
          );
        }

        const result = await response.json();

        if (
          result.candidates &&
          result.candidates.length > 0 &&
          result.candidates[0].content &&
          result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0
        ) {
          const text = result.candidates[0].content.parts[0].text;
          chatHistory.push({ role: "model", parts: [{ text: text }] });
          return text;
        } else {
          console.warn("Estructura de respuesta inesperada del LLM:", result);
          return "Lo siento, no pude generar una respuesta en este momento. Por favor, intenta de nuevo más tarde.";
        }
      } catch (error) {
        console.error("Error en la función callLLM (catch block):", error);
        return "Lo siento, no tengo el conocimiento para responder a esa pregunta en este momento. ";
      }
    }

    // Función para manejar el bucle de entrada de texto principal
    async function handleTextInputLoop(knowledgeBase, tesinasData) {
      while (true) {
        const input = await botui.action.text({
          action: {
            placeholder: "Escribe tu pregunta aquí...",
          },
          autofocus: false,
          force_scroll: false,
        });

        const userQuestion = input.value.trim();

        if (userQuestion) {
          let botResponse = findAnswerInKnowledgeBase(
            userQuestion,
            knowledgeBase
          );

          if (botResponse) {
            await botui.message.bot({
              content: botResponse,
            });
          } else {
            await botui.message.bot({
              content:
                "Buscando una respuesta... (Esto puede tardar un momento)",
            });
            const llmPrompt = `El usuario pregunta: "${userQuestion}". Basado en la información de tesinas proporcionada y tu conocimiento general sobre tesinas de informática de la UNLP, por favor proporciona una respuesta concisa y útil. Si no tienes información específica, indica que no puedes responder directamente pero ofrece una sugerencia general.`;
            const llmAnswer = await callLLM(llmPrompt, tesinasData);
            await botui.message.bot({
              content: llmAnswer,
            });
          }
        } else {
          await botui.message.bot({
            content: "Por favor, escribe algo para que pueda ayudarte.",
          });
        }
      }
    }

    // Función para inicializar y empezar la conversación del chatbot
    async function initializeAndStartChatbot() {
      botui = new BotUI("botui-app");

      const knowledgeBase = await loadKnowledgeBase();
      tesinasData = await loadTesinasData();

      await botui.message.bot({
        content:
          "¡Hola! Soy tu asistente de tesinas. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre qué es una tesina, cómo buscar, etc.",
        scroll: false,
      });

      // Iniciar el bucle de entrada de texto
      handleTextInputLoop(knowledgeBase, tesinasData);
    }

    // Event listener para el botón "Iniciar Chatbot"
    startChatbotBtn.addEventListener("click", () => {
      startChatbotBtn.classList.add("d-none");
      tesinaDesc.classList.add("d-none");
      botuiAppElement.classList.remove("d-none");
      initializeAndStartChatbot();
    });

    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, 200);
});
