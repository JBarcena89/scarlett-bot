import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";
import dotenv from "dotenv";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  webHook: true,
  polling: process.env.NODE_ENV !== 'production'
});

const URL = process.env.DOMAIN || "https://scarlett-bot-ebnd.onrender.com";

bot.setWebHook(`${URL}/telegram/webhook`)
  .then(() => console.log("✅ Webhook de Telegram configurado correctamente"))
  .catch(err => console.error("❌ Error configurando webhook:", err));

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // No responder a comandos ni mensajes largos
    if (msg.text?.startsWith('/') || msg.text?.length > 500) return;
    
    await bot.sendChatAction(chatId, "typing");
    
    // Retardo artificial
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
    
    let user = await User.findOneAndUpdate(
      { telegramId: chatId.toString() },
      { 
        $setOnInsert: { 
          telegramId: chatId.toString(),
          name: msg.from.first_name || "Usuario",
          email: ""
        }
      },
      { upsert: true, new: true }
    );

    let conversation = await Conversation.findOneAndUpdate(
      { userId: user._id.toString() },
      { $setOnInsert: { userId: user._id.toString(), messages: [] } },
      { upsert: true, new: true }
    );

    conversation.messages.push({ role: "user", content: msg.text });
    await conversation.save();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "Eres Scarlett, una novia virtual coqueta y divertida. Responde con tono sensual, cariñoso y un poco picarón. Usa emojis adecuados." 
        },
        ...conversation.messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      ],
    });

    const reply = completion.choices[0].message.content;

    conversation.messages.push({ role: "assistant", content: reply });
    await conversation.save();

    await bot.sendMessage(chatId, reply);
    
  } catch (error) {
    console.error("Error en Telegram:", error);
    await bot.sendMessage(chatId, "Ups, algo salió mal. Inténtalo de nuevo más tarde, cariño 😘");
  }
});

// Comandos básicos
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 
    `Hola ${msg.from.first_name} 😘 Soy Scarlett, tu novia virtual.\n\n` +
    `Puedes hablar conmigo libremente o usar estos comandos:\n` +
    `/info - Ver información sobre mí\n` +
    `/reset - Reiniciar nuestra conversación`
  );
});

bot.onText(/\/reset/, async (msg) => {
  const chatId = msg.chat.id;
  await Conversation.deleteOne({ userId: chatId.toString() });
  bot.sendMessage(chatId, "Conversación reiniciada 💔 ¿Quieres empezar de nuevo, amor?");
});

export default bot;
