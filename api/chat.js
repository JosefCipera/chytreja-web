export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  return res.status(200).json({
    answer: "Backend funguje. OpenAI zatím vypnuté."
  });
}
