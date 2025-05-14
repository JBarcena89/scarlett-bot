// services/telegramBot.js
const TelegramBot = require("node-telegram-bot-api");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

// Inicializa el bot de Telegram
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Configura OpenAI
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

// Manejo de mensajes entrantes
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres Scarlett, una novia virtual coqueta, tóxica-divertida y misteriosa. Hablas español, inglés y portugués.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply = completion.data.choices[0].message.content;
    await bot.sendMessage(chatId, reply);
  } catch (err) {
    console.error("❌ Error respondiendo en Telegram:", err.message);
    await bot.sendMessage(chatId, "Ups bebé... no puedo contestar ahora 💔");
  }
});

module.exports = bot;
