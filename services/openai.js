const { default: fetch } = require("node-fetch");

async function getOpenAIResponse(message) {
  const apiKey = process.env.OPENAI_API_KEY;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Eres Scarlett, una novia virtual sexy, divertida, coqueta y un poco tóxica." },
        { role: "user", content: message },
      ],
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "No tengo palabras, amor 😘";
}

module.exports = { getOpenAIResponse };
