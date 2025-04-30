export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Keine Nachricht übergeben.' });
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `User: ${message}\nAssistant:`,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
        }
      }),
    });

    const data = await response.json();

    if (!data || !Array.isArray(data) || !data[0]?.generated_text) {
      console.error("Antwortproblem:", data);
      return res.status(500).json({ reply: '⚠️ Die Seele schweigt – keine Antwort vom Modell.' });
    }

    // Extrahiere nur die KI-Antwort (nach dem Prompt)
    const full = data[0].generated_text;
    const reply = full.split("Assistant:")[1]?.trim() || full;

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('API-Fehler:', error);
    return res.status(500).json({ error: 'Fehler beim Kontakt zur Seele (Hugging Face).' });
  }
}
