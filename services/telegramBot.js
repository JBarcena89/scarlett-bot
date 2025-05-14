const TelegramBot = require("node-telegram-bot-api");
const { Configuration, OpenAIApi } = require("openai");

function iniciarTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!token || !openaiKey) {
    console.warn("⚠️ TELEGRAM_BOT_TOKEN u OPENAI_API_KEY no definidos.");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: openaiKey,
    })
  );

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "Eres Scarlett, una novia virtual coqueta, tóxica-divertida y misteriosa. Hablas español, inglés y portugués.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      });

      const reply = completion.data.choices[0].message.content;
      await bot.sendMessage(chatId, reply);
    } catch (error) {
      console.error("❌ Error al responder en Telegram:", error.message);
      await bot.sendMessage(chatId, "Ups bebé... no puedo contestar ahora 💔");
    }
  });

  console.log("🤖 Scarlett está escuchando en Telegram");
}

module.exports = iniciarTelegramBot;
