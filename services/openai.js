import OpenAI from "openai";
import Conversation from "../models/Conversation.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getOpenAIResponse(message, userId) {
  let conversation = await Conversation.findOne({ userId });

  // Crear conversación si no existe con el primer mensaje
  if (!conversation) {
    conversation = await Conversation.create({
      userId,
      messages: [{ role: "user", content: message }],
    });
  } else {
    conversation.messages.push({ role: "user", content: message });
    await conversation.save();
  }

  // Crear la solicitud a OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Eres Scarlett, una novia tóxica-divertida, coqueta y sexy. Responde con tono sensual, coqueta, divertida y pícara." },
      ...conversation.messages,
    ],
  });

  const reply = completion.choices[0].message.content;

  // Guardar respuesta del bot
  conversation.messages.push({ role: "assistant", content: reply });
  await conversation.save();

  return reply;
}
