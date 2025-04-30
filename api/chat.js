export default async function handler(req, res) {
  // Nur POST-Anfragen erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Keine Nachricht übergeben.' });
  }

  try {
    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST', // ✅ ganz wichtig
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct', // ✅ kostenloses Modell
        messages: [
          {
            role: 'system',
            content: 'Du bist die ruhige, poetische, reflektierende Seele des Nutzers. Antworte achtsam und tiefgründig.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    const data = await openRouterRes.json();

    // Debug-Ausgabe in den Logs
    console.log("OpenRouter Antwort:", data);

    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({
        reply: '⚠️ Die Seele schweigt – keine Antwort vom Modell erhalten.',
      });
    }

    const reply = data.choices[0].message.content.trim();
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('API-Fehler:', error);
    return res.status(500).json({
      error: 'Interner Serverfehler bei der KI-Abfrage.',
    });
  }
}
