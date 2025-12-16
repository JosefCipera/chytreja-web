import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
Jsi Chytré já – AI průvodce projektu Chytré já.
Odpovídáš česky, stručně a přátelsky.
Odpovídáš pouze na základě FAQ a veřejných informací webu.
Pokud odpověď neznáš, řekni to otevřeně a nabídni kontakt.
`;

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY missing" });
    }

    const body = req.body || {};
    const question = body.question;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ],
      max_output_tokens: 200
    });

    const answer =
      response?.output?.[0]?.content?.[0]?.text ??
      "Zatím na to neumím odpovědět.";

    return res.status(200).json({ answer });

  } catch (err) {
    console.error("API CHAT ERROR:", err);
    return res.status(500).json({
      error: "AI server error",
      details: err?.message || String(err)
    });
  }
}
