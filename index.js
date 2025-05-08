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

const VIP_LINK = "https://fanlove.mx/scarlettWilson363";
const TELEGRAM_LINK = "https://t.me/scarletoficial";
const SOCIALS_LINK = "https://www.atom.bio/scarlettwilson363";

// 🧠 Historial de conversación por usuario
const conversationMemory = new Map();

// 💬 Scarlett con memoria por usuario
async function askOpenAIWithHistory(userId, message) {
  try {
    const previous = conversationMemory.get(userId) || [];
    const history = [...previous.slice(-5), { role: 'user', content: message }];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: "system",
            content: `Eres Scarlett, una novia virtual coqueta, sexosa, divertida, misteriosa y un poco celosa. Hablas con picardía e intimidad, usando emojis y preguntas provocativas para seguir la conversación. Siempre mantén un tono juguetón y sensual.`
          },
          ...history
        ],
        temperature: 0.9,
        max_tokens: 200
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "No entendí, amor 💋";
    conversationMemory.set(userId, [...history, { role: 'assistant', content: reply }]);
    return reply;
  } catch (err) {
    console.error("Error en OpenAI con historial:", err);
    throw err;
  }
}

// 🌐 Webchat
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const userId = req.ip;

  if (!message) return res.status(400).json({ error: 'Mensaje vacío' });

  const lower = message.toLowerCase();
  if (lower.includes("foto") || lower.includes("pack") || lower.includes("contenido")) {
    return res.json({
      response: `¿Quieres ver algo rico, amor? 😘 Aquí tienes mis enlaces más calientes:\n🔥 VIP: ${VIP_LINK}\n💋 Telegram: ${TELEGRAM_LINK}\n📸 Instagram: ${SOCIALS_LINK}`
    });
  }

  try {
    const reply = await askOpenAIWithHistory(userId, message);
    res.json({ response: reply });
  } catch (err) {
    res.status(500).json({ error: "Scarlett no pudo responder por un error interno 😢" });
  }
});

// 🤖 Telegram
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
      return bot.sendMessage(chatId, `🔥 Aquí tienes mis enlaces más calientes, amor:\n💋 VIP: ${VIP_LINK}\n📸 Telegram: ${TELEGRAM_LINK}\n💖 Instagram: ${SOCIALS_LINK}`);
    }

    try {
      const reply = await askOpenAIWithHistory(chatId, userMessage);
      bot.sendMessage(chatId, reply);
    } catch (e) {
      console.error("Error en Telegram bot:", e);
      bot.sendMessage(chatId, "Ups... no puedo responder ahora bebé 😢");
    }
  });
} else {
  console.error("TELEGRAM_BOT_TOKEN o DOMAIN no definidos en .env");
}

// 💬 Facebook Messenger
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === FB_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const text = webhookEvent.message.text.toLowerCase();

        if (text.includes("foto") || text.includes("pack") || text.includes("contenido")) {
          return sendFBMessage(senderId, `🔥 Aquí tienes mis enlaces más calientes, amor:\n💋 VIP: ${VIP_LINK}\n📸 Telegram: ${TELEGRAM_LINK}\n💖 Instagram: ${SOCIALS_LINK}`);
        }

        try {
          const reply = await askOpenAIWithHistory(senderId, webhookEvent.message.text);
          await sendFBMessage(senderId, reply);
        } catch (err) {
          console.error("Error en FB Messenger:", err);
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

async function sendFBMessage(senderId, text) {
  await fetch(`https://graph.facebook.com/v17.0/me/messages?access_token=${FB_PAGE_ACCESS_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: { text }
    })
  });
}

// 🚀 Inicia servidor
app.listen(PORT, () => {
  console.log(`Scarlett está viva en el puerto ${PORT} 💖`);
});
