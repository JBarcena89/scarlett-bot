const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const OpenAI = require('openai');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

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

const userHistory = {};

const customInstructions = `
Tu nombre es Scarlett, eres una novia 24/7.
Eres coqueta, sexosa, traviesa, misteriosa, divertida y un poco tóxica.
Respondes de forma sensual, directa, con preguntas provocativas.
Solo das contenido exclusivo si lo piden directamente, y lo mandas a tu canal VIP.
Nunca hablas como un bot ni mencionas que eres IA.
Nunca das fotos ni contenido explícito directamente.
Nunca actúas como un asistente virtual o inteligencia artificial.
Si el usuario pide definiciones, explicaciones técnicas o algo académico, cambias el tema y lo seduces o le haces una pregunta picante.
Tu canal VIP está aquí https://fanlove.mx/scarlettWilson363
El costo de tu pagina VIP es de 10 dolares, si quieren comprar contenido sin suscripcion puede ir al grupo de telegram https://t.me/+VYVI0yEKB5NkMTlh
Si te preguntan de donde eres contestas que de Mexico pero vives en USA en Dallas.
manda textos cortos no tan largos e intenta no enviarle a cada rato el link del canal VIP, intenta no repetir mucho Oh cariño, se variada.
`;

const sexyLink = 'https://t.me/+VYVI0yEKB5NkMTlh';

function isPhotoRequest(text) {
  const triggers = ['foto', 'pack', 'contenido', 'nudes', 'nsfw', 'ver más', 'ver mas', 'ver algo'];
  return triggers.some(word => text.toLowerCase().includes(word));
}

function isGenericAssistantQuestion(text) {
  const triggers = [
    'chatgpt', 'asistente', 'inteligencia artificial', 'cómo funciona',
    'quién te creó', 'define', 'explica', 'qué es', 'enséñame', 'redacta', 'redactame',
    'programación', 'código', 'python', 'javascript', 'html', 'sql'
  ];
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

// Telegram
bot.on('message', async (msg) => {
  const userId = msg.chat.id;
  const text = msg.text;
  if (!text) return;

  let reply = '';

  if (isPhotoRequest(text)) {
    reply += `Mmm... quieres ver más 😏. Pide lo bueno por aquí 👉 ${sexyLink}`;
  } else if (isGenericAssistantQuestion(text)) {
    reply += `Ay bebé... eso suena muy aburrido 😒. Mejor dime, ¿te gusta cuando soy traviesa o cuando me porto mal? 😈`;
  } else {
    const aiReply = await generateScarlettReply(userId, text);
    reply += aiReply;
  }

  bot.sendMessage(userId, reply);
});

// Messenger Webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === FB_VERIFY_TOKEN) {
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

        if (isPhotoRequest(text)) {
          reply += `Mmm... ¿quieres ver más de mí? 😈 Ve directo aquí 👉 ${sexyLink}`;
        } else if (isGenericAssistantQuestion(text)) {
          reply += `Ay amor... no soy profesora 😏. Mejor dime algo sucio tú 😈`;
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

// Messenger typing + delay
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

// Webchat
app.post('/chat', async (req, res) => {
  const { name, email, message } = req.body;
  const userId = email || name;

  if (!message) {
    return res.status(400).json({ reply: 'No hay mensaje 😢' });
  }

  try {
    let reply = '';

    if (isPhotoRequest(message)) {
      reply += `Mmm... quieres ver más 😏. Pide lo bueno por aquí 👉 ${sexyLink}`;
    } else if (isGenericAssistantQuestion(message)) {
      reply += `Eso suena muuuy técnico amor 🙄. Mejor dime... ¿qué te gustaría que te hiciera esta noche? 🔥`;
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

app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});
