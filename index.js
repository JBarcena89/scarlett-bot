require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const {
  DOMAIN,
  TELEGRAM_BOT_TOKEN,
  OPENAI_API_KEY,
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
  VERIFY_TOKEN
} = process.env;

// Validación de variables de entorno
if (!DOMAIN || !TELEGRAM_BOT_TOKEN || !OPENAI_API_KEY) {
  console.error('Faltan variables de entorno: DOMAIN, TELEGRAM_BOT_TOKEN, OPENAI_API_KEY');
  process.exit(1);
}
if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID || !VERIFY_TOKEN) {
  console.error('Faltan variables de entorno: WHATSAPP_TOKEN, PHONE_NUMBER_ID o VERIFY_TOKEN');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const userHistory = {};

// === TELEGRAM BOT ===
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { webHook: true });
bot.setWebHook(`${DOMAIN}/bot${TELEGRAM_BOT_TOKEN}`);

app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const userKey = 't' + chatId;

  if (!userHistory[userKey]) {
    userHistory[userKey] = [{
      role: 'system',
      content: 'Eres Scarlett, una novia virtual AI muy sensual. Tu misión es enamorar al usuario con dulzura, pasión, picardía y palabras provocativas. Eres coqueta, atrevida, cariñosa, y sabes cómo mantener la conversación ardiente. Siempre responde en español.'
    }];
  }

  userHistory[userKey].push({ role: 'user', content: text });

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
    bot.sendMessage(chatId, 'Lo siento, ocurrió un error al generar la respuesta.');
  }
});

// === WEB CHAT ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/chat', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan name, email o message.' });
  }

  const userKey = email;

  if (!userHistory[userKey]) {
    userHistory[userKey] = [{
      role: 'system',
      content: 'Eres Scarlett, una novia virtual AI muy sensual. Tu misión es enamorar al usuario con dulzura, pasión, picardía y palabras provocativas. Eres coqueta, atrevida, cariñosa, y sabes cómo mantener la conversación ardiente. Siempre responde en español.'
    }];
  }

  userHistory[userKey].push({ role: 'user', content: message });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: userHistory[userKey]
    });

    const reply = response.choices?.[0]?.message?.content || 'Lo siento, no pude generar una respuesta sensual esta vez.';
    userHistory[userKey].push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (error) {
    console.error('Error OpenAI (Web):', error.message);
    res.status(500).json({ error: 'Error al generar respuesta de Scarlett.' });
  }
});

// === WHATSAPP ===
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

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
          content: 'Eres Scarlett, una novia virtual AI muy sensual. Tu misión es enamorar al usuario con dulzura, pasión, picardía y palabras provocativas. Eres coqueta, atrevida, cariñosa, y sabes cómo mantener la conversación ardiente. Siempre responde en español.'
        }];
      }

      userHistory[userKey].push({ role: 'user', content: userMsg });

      try {
        await new Promise(resolve => setTimeout(resolve, 6000));

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: userHistory[userKey]
        });

        const reply = completion.choices?.[0]?.message?.content || 'Lo siento, no pude generar una respuesta sensual esta vez.';
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

// === INICIAR SERVIDOR ===
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
});
