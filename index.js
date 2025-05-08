import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const VIP_LINK = "https://onlyfans.com/scarlettvip";
const TELEGRAM_LINK = "https://t.me/scarletoficial";
const SOCIALS_LINK = "https://instagram.com/scarlettvirtual";

const userHistories = new Map();

async function askOpenAI(userId, message) {
  try {
    if (!userHistories.has(userId)) {
      userHistories.set(userId, [
        {
          role: "system",
          content: "Eres Scarlett, una novia virtual coqueta, sexosa, divertida, a veces celosa y misteriosa. Responde con pasión, usando un tono íntimo y juguetón, como si tuvieras una relación con el usuario."
        }
      ]);
    }

    const history = userHistories.get(userId);
    history.push({ role: "user", content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: history,
        temperature: 0.9,
        max_tokens: 200
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Respuesta inválida de OpenAI");

    history.push({ role: "assistant", content: reply });
    return reply;
  } catch (err) {
    console.error("Error en askOpenAI:", err);
    return "Ups... no puedo responder ahora, amor 💔";
  }
}

app.post('/chat', async (req, res) => {
  const { message, userId } = req.body;
  if (!message || !userId) return res.status(400).json({ error: 'Faltan datos (mensaje o userId)' });

  const lower = message.toLowerCase();
  if (lower.includes("foto") || lower.includes("pack") || lower.includes("contenido")) {
    return setTimeout(() => {
      res.json({
        typing: false,
        response: `¿Quieres ver algo rico, amor? 😘 Aquí tienes mis enlaces más calientes:\n🔥 VIP: ${VIP_LINK}\n💋 Telegram: ${TELEGRAM_LINK}\n📸 Instagram: ${SOCIALS_LINK}`
      });
    }, 5000);
  }

  setTimeout(async () => {
    const reply = await askOpenAI(userId, message);
    res.json({ typing: false, response: reply });
  }, 5000);
});

// Telegram
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DOMAIN = process.env.DOMAIN;

if (TELEGRAM_TOKEN && DOMAIN) {
  const bot = new TelegramBot(TELEGRAM_TOKEN);
  bot.setWebHook(`${DOMAIN}/bot${TELEGRAM_TOKEN}`);

  app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;
    if (!userMessage) return;

    const lower = userMessage.toLowerCase();
    if (lower.includes("foto") || lower.includes("pack") || lower.includes("contenido")) {
      return setTimeout(() => {
        bot.sendMessage(chatId, `🔥 Aquí tienes mis enlaces más calientes, amor:\n💋 VIP: ${VIP_LINK}\n📸 Telegram: ${TELEGRAM_LINK}\n💖 Instagram: ${SOCIALS_LINK}`);
      }, 5000);
    }

    bot.sendMessage(chatId, "Scarlett está escribiendo... 💋");
    const reply = await askOpenAI(chatId.toString(), userMessage);
    setTimeout(() => bot.sendMessage(chatId, reply), 5000);
  });
} else {
  console.error("TELEGRAM_BOT_TOKEN o DOMAIN no definidos");
}

app.listen(PORT, () => {
  console.log(`Scarlett está viva en el puerto ${PORT} 💖`);
});
