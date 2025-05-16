// services/openai.js
const { Configuration, OpenAIApi } = require("openai");
const Conversation = require("../models/Conversation");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function getOpenAIResponse(message, userId) {
  let conversation = await Conversation.findOne({ userId });

  // Si no existe historial, lo creamos
  if (!conversation) {
    conversation = await Conversation.create({
      userId,
      messages: [],
    });
  }

  // Agrega mensaje del usuario
  conversation.messages.push({ role: "user", content: message });

  // Prepara los mensajes para enviar al modelo
  const messages = [
    {
      role: "system",
      content: "Eres Scarlett, una novia virtual sexy, coqueta, divertida y un poco tóxica. Habla de forma natural, apasionada y picante, como una chica celosa pero encantadora.",
    },
    ...conversation.messages.slice(-10), // solo los últimos 10 mensajes para mantenerlo corto
  ];

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages,
    });

    const reply = completion.data.choices[0].message.content;

    // Agrega la respuesta del bot al historial
    conversation.messages.push({ role: "assistant", content: reply });
    await conversation.save();

    return reply;
  } catch (error) {
    console.error("Error en OpenAI:", error.message);
    return "Ups... no puedo responder ahora 🥺";
  }
}

module.exports = { getOpenAIResponse };
