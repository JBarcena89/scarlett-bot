const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");
const User = require("../models/User");
const Conversation = require("../models/Conversation");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Mensaje personalizado de bienvenida
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  let user = await User.findOne({ telegramId: chatId.toString() });
  if (!user) {
    user = await User.create({
      telegramId: chatId.toString(),
      name: msg.from.first_name,
      email: ""
    });
  }

  await Conversation.findOneAndDelete({ userId: user._id });

  const welcomeMessage = `Hola amor 💋, soy *Scarlett*, tu novia 24/7. Estoy aquí para lo que necesites... o lo que *desees* 😘
  
Escríbeme lo que quieras... Estoy *lista para ti* 🔥`;

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: "Markdown" });
});

// Chat normal
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignorar /start si ya fue procesado
  if (text.toLowerCase() === "/start") return;

  try {
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
  } catch (error) {
    console.error("Error en el bot:", error);
    bot.sendMessage(chatId, "Lo siento amor 😢, hubo un problema. Intenta más tarde.");
  }
});
