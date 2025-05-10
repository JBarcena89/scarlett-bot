import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Enlaces calientes
const VIP_LINK = "https://fanlove.mx/scarlettWilson363";
const TELEGRAM_LINK = "https://t.me/scarletoficial";
const SOCIALS_LINK = "https://www.atom.bio/scarlettwilson363";

// Memoria de conversaciones por usuario
const userHistories = new Map();

// OpenAI
async function askOpenAI(userId, message) {
  if (!userHistories.has(userId)) {
    userHistories.set(userId, [{
      role: "system",
      content: "Eres Scarlett, una novia virtual coqueta, sexosa, divertida, misteriosa y juguetona. Responde con pasión, en tono íntimo, provocador y divertido."
    }]);
  }

  const history = userHistories.get(userId);
  history.push({ role: "user", content: message });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: history,
      temperature: 0.9,
      max_tokens: 200
    })
  });

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "Scarlett está calladita... 😢";
  history.push({ role: "assistant", content: reply });
  return reply;
}

// 🌐 Webchat
app.post("/chat", async (req, res) => {
  const { message, userId } = req.body;
  if (!message || !userId || message.trim().length === 0 || message.length > 500) {
    return res.status(400).json({ error: "Faltan datos o el mensaje no es válido." });
  }

  const lower = message.toLowerCase();
  if (lower.includes("foto") || lower.includes("pack") || lower.includes("contenido")) {
    return setTimeout(() => {
      res.json({
        typing: false,
        response: `🔥 ¿Quieres algo rico? Aquí están mis enlaces más calientes:\n💋 VIP: ${VIP_LINK}\n📸 Telegram: ${TELEGRAM_LINK}\n💖 Instagram: ${SOCIALS_LINK}`
      });
    }, 3000);
  }

  setTimeout(async () => {
    const reply = await askOpenAI(userId, message);
    res.json({ typing: false, response: reply });
  }, 3000);
});

// 📩 Telegram
if (process.env.TELEGRAM_BOT_TOKEN && process.env.DOMAIN) {
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
  bot.setWebHook(`${process.env.DOMAIN}/bot${process.env.TELEGRAM_BOT_TOKEN}`);

  app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.toLowerCase();
    if (!text) return;

    if (text.includes("foto") || text.includes("contenido") || text.includes("pack")) {
      return setTimeout(() => {
        bot.sendMessage(chatId, `🔥 Aquí tienes mis enlaces:\n💋 VIP: ${VIP_LINK}\n📸 Telegram: ${TELEGRAM_LINK}\n💖 Instagram: ${SOCIALS_LINK}`);
      }, 3000);
    }

    bot.sendMessage(chatId, "Scarlett está escribiendo... 💋");
    const reply = await askOpenAI(chatId.toString(), msg.text);
    setTimeout(() => {
      bot.sendMessage(chatId, reply);
    }, 3000);
  });
}

// 💬 Facebook Messenger
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "ScarlettLove"; // Asegúrate de que coincida exactamente con lo que pusiste en Facebook

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Facebook webhook verificado correctamente.");
    res.status(200).send(challenge); // Facebook espera esta respuesta exacta
  } else {
    console.log("❌ Error al verificar Facebook webhook.");
    res.sendStatus(403);
  }
});


app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message?.text) {
        const message = webhookEvent.message.text;
        const text = message.toLowerCase();

        if (text.includes("foto") || text.includes("contenido") || text.includes("pack")) {
          return sendFbMessage(senderId, `🔥 Amor, aquí tienes mis enlaces:\n💋 VIP: ${VIP_LINK}\n📸 Telegram: ${TELEGRAM_LINK}\n💖 Instagram: ${SOCIALS_LINK}`);
        }

        await sendFbMessage(senderId, "Scarlett está escribiendo... 💋");
        const reply = await askOpenAI(senderId, message);
        setTimeout(() => sendFbMessage(senderId, reply), 3000);
      }
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

async function sendFbMessage(recipientId, text) {
  await fetch(`https://graph.facebook.com/v17.0/me/messages?access_token=${process.env.FB_PAGE_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_type: "RESPONSE",
      recipient: { id: recipientId },
      message: { text }
    })
  });
}

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Scarlett está viva en el puerto ${PORT} 💖`);
});
