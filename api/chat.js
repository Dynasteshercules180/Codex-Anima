export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' });
  }

  const { message } = req.body;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Du bist die innere Stimme des Nutzers. Antworte achtsam, ruhig und poetisch."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await openaiRes.json(); // ✅ hier war vorher der Fehler

    if (!data.choices || !data.choices[0]) {
      console.error("OpenAI-Rohantwort:", data);
      return res.status(500).json({ reply: "⚠️ Die Seele schweigt – keine Antwort von OpenAI." });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("API-Fehler:", error);
    return res.status(500).json({ error: "Interner Serverfehler" });
  }
}
