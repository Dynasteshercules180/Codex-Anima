export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Only POST allowed' });
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
            content: "Du bist die innere Stimme des Nutzers. Sprich ruhig, achtsam, poetisch und reflektierend."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

   const data = await response.json();

if (!data.choices || !data.choices[0]) {
  console.error("OpenAI-Rohantwort:", data);
  return res.status(500).json({ reply: "⚠️ Die Seele schweigt – OpenAI gab keine Antwort zurück." });
}

const reply = data.choices[0].message.content;
res.status(200).json({ reply });
  } catch (err) {
    console.error("API-Fehler:", err);
    res.status(500).json({ error: "OpenAI-Fehler" });
  }
}
