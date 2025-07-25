// api/gemini-proxy.js

export default async function handler(req, res) {
  // SOLO aquí accedemos a la API Key, que está segura como variable de entorno
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  if (!apiKey) {
    console.error(
      "Error: GEMINI_API_KEY no configurada en las variables de entorno de Vercel."
    );
    return res
      .status(500)
      .json({ error: "Configuración del servidor incompleta." });
  }

  // Vercel API Routes automáticamente parsean el body JSON para POST requests
  const payload = req.body;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Error en la API de Gemini (proxy):",
        response.status,
        errorData
      );
      return res.status(response.status).json({
        error: "Error al comunicarse con la API de Gemini",
        details: errorData,
      });
    }

    const result = await response.json();
    res.status(200).json(result); // Devuelve la respuesta de Gemini directamente al frontend
  } catch (error) {
    console.error("Error en la función gemini-proxy:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al procesar la solicitud." });
  }
}
