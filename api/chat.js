export default async function handler(req, res) {
  // Nur POST-Anfragen zulassen
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Keine Nachricht übergeben.' });
  }

  try {
   const openaiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "mistralai/mistral-7b-instruct", // z. B. Open-Source-Modell
    messages: [
      { role: "system", content: "Du bist die innere Stimme..." },
      { role: "user", content: message }
    ]
  })
});

    const data = await openaiRes.json();

    // Debug-Ausgabe in Logs
    console.log("OpenAI Antwort:", data);

    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ reply: '⚠️ Die Seele schweigt – keine Antwort von der KI erhalten.' });
    }

    const reply = data.choices[0].message.content.trim();
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('API-Fehler:', error);
    return res.status(500).json({ error: 'Interner Serverfehler beim Abrufen der KI-Antwort.' });
  }
}
