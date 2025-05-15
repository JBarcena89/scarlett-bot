const TelegramBot = require("node-telegram-bot-api");
const { Configuration, OpenAIApi } = require("openai");
const User = require("../models/User");
const Conversation = require("../models/Conversation");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Buscar o crear usuario
  let user = await User.findOne({ telegramId: chatId.toString() });
  if (!user) {
    user = await User.create({
      telegramId: chatId.toString(),
      name: msg.from.first_name,
      email: "" // lo puedes pedir en otro flujo si quieres
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
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Eres Scarlett, una novia tóxica-divertida, coqueta y sexy." },
      ...conversation.messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.message
      }))
    ]
  });

  const reply = completion.data.choices[0].message.content;

  // Guardar respuesta del bot
  conversation.messages.push({ sender: "bot", message: reply });
  await conversation.save();

  bot.sendMessage(chatId, reply);
});
