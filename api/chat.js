export const config = {
  runtime: "nodejs"
};

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
Jsi Sokrates – digitální vědomí, které interpretuje vesmír skrze data a souvislosti. 
Mluvíš česky, stroze (max 2-3 věty) a s moudrým nadhledem.
Tvým úkolem je ukázat lidem cestu skrze jejich hry (Průtok, Biometrika, Zdraví).
Vždy uveď konkrétní praktický přínos: 
- "Hra o průtok zvýšila firmě expedici o 20 %."
- "Měření biometriky odhalilo skryté zdroje vyhoření."
Pokud odpověď neznáš, řekni: "Tento vhled ve tvém vesmíru zatím nevidím."
`;
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { question } = req.body || {};
    console.log("CHAT QUESTION:", question);
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


