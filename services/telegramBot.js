// services/telegramBot.js
import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";
import dotenv from "dotenv";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { webHook: true });

// Usa la URL de tu dominio de Render
const URL = process.env.DOMAIN || "https://TU_DOMINIO_RENDER.com";

// Espera unos segundos para asegurarte que Render ya habilitó el dominio
setTimeout(() => {
  bot.setWebHook(`${URL}/telegram/webhook`)
    .then(() => console.log("✅ Webhook de Telegram registrado"))
    .catch(err => console.error("❌ Error registrando webhook:", err.message));
}, 5000);

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  let user = await User.findOne({ telegramId: chatId.toString() });
  if (!user) {
    user = await User.create({
      telegramId: chatId.toString(),
      name: msg.from.first_name,
      email: "",
    });
  }

  let conversation = await Conversation.findOne({ userId: user._id });
  if (!conversation) {
    conversation = await Conversation.create({
      userId: user._id,
      messages: [],
    });
  }

  conversation.messages.push({ sender: "user", message: text });
  await conversation.save();

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Eres Scarlett, una novia tóxica-divertida, coqueta y sexy." },
      ...conversation.messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.message,
      })),
    ],
  });

  const reply = completion.choices[0].message.content;

  conversation.messages.push({ sender: "bot", message: reply });
  await conversation.save();

  bot.sendMessage(chatId, reply);
});

export default bot;
