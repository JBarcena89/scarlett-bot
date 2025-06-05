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
const DOMAIN = process.env.DOMAIN;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
bot.setWebHook(`${DOMAIN}/bot${TELEGRAM_BOT_TOKEN}`);
console.log(`✅ Webhook set: ${DOMAIN}/bot${TELEGRAM_BOT_TOKEN}`);

app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Messenger
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

// WhatsApp (si lo usas)
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Historial por usuario
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

const sexyLink = 'https://t.me/+VYVI0yEKB5NkMTlh';

function isPhotoRequest(text) {
  const triggers = ['foto', 'pack', 'contenido', 'nudes', 'nsfw', 'ver más', 'ver mas', 'ver algo'];
  return triggers.some(word => text.toLowerCase().includes(word));
}

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

// 💬 Telegram
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

// 💬 Messenger webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
    console.log('✅ Webhook de Messenger verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const text = webhookEvent.message.text;
        let reply = '';

        if (!userIntroSent.has(senderPsid)) {
          reply += `Hola amor 😘, soy Scarlett 💋. ¿Qué travesura tienes en mente?\n\n`;
          userIntroSent.add(senderPsid);
        }

        if (isPhotoRequest(text)) {
          reply += `Mmm... ¿quieres ver más de mí? 😈 Ve directo aquí 👉 ${sexyLink}`;
        } else {
          const aiReply = await generateScarlettReply(senderPsid, text);
          reply += aiReply;
        }

        await sendMessageToMessenger(senderPsid, reply);
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// 📨 Función para responder en Messenger con "typing..." + delay
async function sendMessageToMessenger(senderPsid, message) {
  try {
    await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${FB_PAGE_TOKEN}`, {
      recipient: { id: senderPsid },
      sender_action: 'typing_on'
    });

    const delay = Math.floor(Math.random() * 2000) + 3000;
    await new Promise(resolve => setTimeout(resolve, delay));

    await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${FB_PAGE_TOKEN}`, {
      recipient: { id: senderPsid },
      message: { text: message }
    });
  } catch (err) {
    console.error('❌ Error enviando a Messenger:', err.message);
  }
}

// 💬 Webchat: responde al frontend
app.post('/chat', async (req, res) => {
  const { name, email, message } = req.body;
  const userId = email || name;

  if (!message) {
    return res.status(400).json({ reply: 'No hay mensaje 😢' });
  }

  try {
    let reply = '';
    if (!userIntroSent.has(userId)) {
      reply += `Hola bebé 😘, soy Scarlett 💋. ¿En qué travesura estás pensando hoy?\n\n`;
      userIntroSent.add(userId);
    }

    if (isPhotoRequest(message)) {
      reply += `Mmm... quieres ver más 😏. Pide lo bueno por aquí 👉 ${sexyLink}`;
    } else {
      const aiReply = await generateScarlettReply(userId, message);
      reply += aiReply;
    }

    res.json({ reply });
  } catch (err) {
    console.error('❌ Error en /chat:', err.message);
    res.status(500).json({ reply: 'Ups... hubo un problema, bebé 💔' });
  }
});

// 🚀 Inicia el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});
