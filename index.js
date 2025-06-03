const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const userHistory = {};
const userIntroSent = new Set();

const customInstructions = `
Tu nombre es Scarlett, eres una novia virtual 24/7.
Eres coqueta, sexosa, traviesa, misteriosa, divertida y un poco tóxica.
Respondes de forma sensual, directa, con preguntas provocativas.
Solo das contenido exclusivo si lo piden directamente, y lo mandas a tu canal VIP.
Nunca hablas como un bot ni mencionas que eres IA. Siempre coqueteas como si fueras real.
Nunca das fotos ni contenido explícito directamente.
`;

// Detecta si piden foto o contenido
function isPhotoRequest(text) {
  const triggers = ['foto', 'pack', 'contenido', 'nudes', 'nsfw', 'ver más', 'ver mas', 'ver algo'];
  return triggers.some(word => text.toLowerCase().includes(word));
}

const sexyLink = 'https://t.me/+VYVI0yEKB5NkMTlh';
const sexyReply = `Mmm… solo en mi canal 😈👉 [entra aquí](${sexyLink}) 🔥`; // Telegram
const sexyReplyPlain = `Mmm… solo en mi canal 😈👉 ${sexyLink} 🔥`; // Web y WhatsApp

// === TELEGRAM BOT ===
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const userKey = 't' + chatId;

  if (!userHistory[userKey]) {
    userHistory[userKey] = [{
      role: 'system',
      content: customInstructions
    }];
  }

  userHistory[userKey].push({ role: 'user', content: text });

  if (isPhotoRequest(text)) {
    await bot.sendMessage(chatId, sexyReply, { parse_mode: 'Markdown' });
    return;
  }

  try {
    await bot.sendChatAction(chatId, 'typing');
    await new Promise(resolve => setTimeout(resolve, 6000));

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: userHistory[userKey]
    });

    const reply = response.choices?.[0]?.message?.content || 'Lo siento, no pude generar una respuesta sensual esta vez.';
    userHistory[userKey].push({ role: 'assistant', content: reply });

    await bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error OpenAI (Telegram):', error.message);
    bot.sendMessage(chatId, 'Ups… algo falló 😢');
  }
});

// === WEB CHAT ===
app.post('/chat', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan name, email o message.' });
  }

  const userKey = email;

  if (!userHistory[userKey]) {
    userHistory[userKey] = [{
      role: 'system',
      content: customInstructions
    }];
  }

  userHistory[userKey].push({ role: 'user', content: message });

  // Primer mensaje automático al entrar
  if (!userIntroSent.has(userKey)) {
    userIntroSent.add(userKey);
    return res.json({ reply: sexyReplyPlain });
  }

  // Si pide foto
  if (isPhotoRequest(message)) {
    return res.json({ reply: sexyReplyPlain });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: userHistory[userKey]
    });

    const reply = response.choices?.[0]?.message?.content || 'Ups… no supe qué decir 😳';
    userHistory[userKey].push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (error) {
    console.error('Error OpenAI (Web):', error.message);
    res.status(500).json({ error: 'Error al generar respuesta de Scarlett.' });
  }
});

// === WHATSAPP ===
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message && message.text && message.from) {
      const userKey = 'w' + message.from;
      const userMsg = message.text.body;

      if (!userHistory[userKey]) {
        userHistory[userKey] = [{
          role: 'system',
          content: customInstructions
        }];
      }

      userHistory[userKey].push({ role: 'user', content: userMsg });

      if (isPhotoRequest(userMsg)) {
        await axios.post(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
          messaging_product: 'whatsapp',
          to: message.from,
          text: { body: sexyReplyPlain }
        }, {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        return res.sendStatus(200);
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 6000));

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: userHistory[userKey]
        });

        const reply = completion.choices?.[0]?.message?.content || 'Ups… no supe qué decir 😳';
        userHistory[userKey].push({ role: 'assistant', content: reply });

        await axios.post(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
          messaging_product: 'whatsapp',
          to: message.from,
          text: { body: reply }
        }, {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error('Error enviando mensaje de Scarlett por WhatsApp:', err.message);
      }
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// INICIO DEL SERVIDOR
app.listen(port, () => {
  console.log(`Scarlett está lista en http://localhost:${port}`);
});
