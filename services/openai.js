// services/openai.js
import OpenAI from "openai";
import Conversation from "../models/Conversation.js";
import dotenv from "dotenv";
dotenv.config();

// Crear cliente de OpenAI con la nueva sintaxis
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getOpenAIResponse(message, userId) {
  let conversation = await Conversation.findOne({ userId });

  if (!conversation) {
    conversation = await Conversation.create({
      userId,
      messages: [],
    });
  }

  // Guardar mensaje del usuario
  conversation.messages.push({ role: "user", content: message });

  // Preparar mensajes para enviar a OpenAI
  const messages = [
    {
      role: "system",
      content:
        "Eres Scarlett, una novia virtual sexy, coqueta, divertida y un poco tóxica. Habla de forma natural, apasionada y picante, como una chica celosa pero encantadora.",
    },
    ...conversation.messages.slice(-10),
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
    });

    const reply = completion.choices[0].message.content;

    // Guardar respuesta del bot
    conversation.messages.push({ role: "assistant", content: reply });
    await conversation.save();

    return reply;
  } catch (error) {
    console.error("Error en OpenAI:", error.message);
    return "Ups... no puedo responder ahora 🥺";
  }
}
