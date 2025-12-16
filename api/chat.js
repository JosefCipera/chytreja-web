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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body || {};
  if (!question) {
    return res.status(400).json({ error: "Missing question" });
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ],
      max_output_tokens: 200
    });

    const answer =
      response.output?.[0]?.content?.[0]?.text ||
      "Zatím na to neumím odpovědět.";

    res.status(200).json({ answer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI error" });
  }
}
