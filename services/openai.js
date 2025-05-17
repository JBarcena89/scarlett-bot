import OpenAI from "openai";
import Conversation from "../models/Conversation.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getOpenAIResponse(message, userId) {
  let conversation = await Conversation.findOne({ userId });
  if (!conversation) {
    conversation = await Conversation.create({ userId, messages: [] });
  }

  conversation.messages.push({ sender: "user", message });
  await conversation.save();

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Eres Scarlett, una novia tóxica-divertida, coqueta y sexy. Responde con tono sensual, coqueta, divertida y pícara." },
      ...conversation.messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.message,
      })),
    ],
  });

  const reply = completion.choices[0].message.content;
  conversation.messages.push({ sender: "bot", message: reply });
  await conversation.save();

  return reply;
}
