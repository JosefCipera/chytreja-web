export const config = {
  runtime: "nodejs"
};

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
Jsi Chytré já – digitální průvodce projektu Chytré já.
Odpovídáš česky, stručně, srozumitelně a přátelsky.
Odpovídáš pouze na základě veřejných informací webu.
Pokud odpověď neznáš, řekni to otevřeně.
`;

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { question } = req.body || {};
    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ],
      temperature: 0.4,
      max_tokens: 200
    });

    const answer =
      completion.choices?.[0]?.message?.content ||
      "Zatím neumím odpovědět.";

    return res.status(200).json({ answer });

  } catch (err) {
    console.error("OPENAI ERROR:", err);
    return res.status(500).json({
      error: "OpenAI call failed",
      detail: err.message
    });
  }
}
