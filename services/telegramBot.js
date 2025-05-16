import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";
import dotenv from "dotenv";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Buscar o crear usuario
  let user = await User.findOne({ telegramId: chatId.toString() });
  if (!user) {
    user = await User.create({
      telegramId: chatId.toString(),
      name: msg.from.first_name,
      email: ""
    });
  }

  // Guardar mensaje del usuario
  let conversation = await Conversation.findOne({ userId: user._id });
  if (!conversation) {
    conversation = await Conversation.create({
      userId: user._id,
      messages: []
    });
  }

  conversation.messages.push({ sender: "user", message: text });
  await conversation.save();

  // Llamada a OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Eres Scarlett, una novia tóxica-divertida, coqueta y sexy." },
      ...conversation.messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.message
      }))
    ]
  });

  const reply = completion.choices[0].message.content;

  // Guardar respuesta del bot
  conversation.messages.push({ sender: "bot", message: reply });
  await conversation.save();

  bot.sendMessage(chatId, reply);
});
