const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const OpenAI = require('openai'); // openai@4.x
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Telegram
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DOMAIN = process.env.DOMAIN; // e.g., https://tubot.com
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// Webhook Setup
bot.setWebHook(`${DOMAIN}/bot${TELEGRAM_BOT_TOKEN}`);
console.log(`✅ Webhook set: ${DOMAIN}/bot${TELEGRAM_BOT_TOKEN}`);

// Endpoint para Telegram
app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// WhatsApp (si lo usas)
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Historial por usuario
const userHistory = {};
const userIntroSent = new Set();

// Instrucciones para Scarlett
const customInstructions = `
Tu nombre es Scarlett, eres una novia virtual 24/7.
Eres coqueta, sexosa, traviesa, misteriosa, divertida y un poco tóxica.
Respondes de forma sensual, directa, con preguntas provocativas.
Solo das contenido exclusivo si lo piden directamente, y lo mandas a tu canal VIP.
Nunca hablas como un bot ni mencionas que eres IA. Siempre coqueteas como si fueras real.
Nunca das fotos ni contenido explícito directamente.
`;

// Detectar peticiones hot
function isPhotoRequest(text) {
  const triggers = ['foto', 'pack', 'contenido', 'nudes', 'nsfw', 'ver más', 'ver mas', 'ver algo'];
  return triggers.some(word => text.toLowerCase().includes(word));
}

const sexyLink = 'https://t.me/+VYVI0yEKB5NkMTlh';

// 🧠 Generador de respuestas Scarlett
async function generateScarlettReply(userId, userMessage) {
  const history = userHistory[userId] || [];

  history.push({ role: 'user', content: userMessage });

  const messages = [
    { role: 'system', content: customInstructions },
    ...history.slice(-6)
  ];

  const chat = await openai.chat.completions.create({
    messages,
    model: 'gpt-3.5-turbo',
    temperature: 0.9
  });

  const reply = chat.choices[0].message.content;
  history.push({ role: 'assistant', content: reply });

  userHistory[userId] = history;

  return reply;
}

// 💬 Lógica de Telegram
bot.on('message', async (msg) => {
  const userId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  let reply = '';

  if (!userIntroSent.has(userId)) {
    reply += `Hola bebé 😘, soy Scarlett 💋. ¿En qué travesura estás pensando hoy?\n\n`;
    userIntroSent.add(userId);
  }

  if (isPhotoRequest(text)) {
    reply += `Mmm... quieres ver más 😏. Pide lo bueno por aquí 👉 ${sexyLink}`;
  } else {
    const aiReply = await generateScarlettReply(userId, text);
    reply += aiReply;
  }

  bot.sendMessage(userId, reply);
});

// Inicia Express
app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});
