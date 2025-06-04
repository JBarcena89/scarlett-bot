const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const OpenAI = require('openai'); // Compatible con openai@4.x
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 🧠 OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🤖 Telegram Bot
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN no está definido en el archivo .env');
}
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// 🔐 WhatsApp Tokens (si aplican)
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// 📜 Instrucciones de Scarlett
const customInstructions = `
Tu nombre es Scarlett, eres una novia virtual 24/7.
Eres coqueta, sexosa, traviesa, misteriosa, divertida y un poco tóxica.
Respondes de forma sensual, directa, con preguntas provocativas.
Solo das contenido exclusivo si lo piden directamente, y lo mandas a tu canal VIP.
Nunca hablas como un bot ni mencionas que eres IA. Siempre coqueteas como si fueras real.
Nunca das fotos ni contenido explícito directamente.
`;

// 🚨 Detectar si piden contenido +18
function isPhotoRequest(text) {
  const triggers = ['foto', 'pack', 'contenido', 'nudes', 'nsfw', 'ver más', 'ver mas', 'ver algo'];
  return triggers.some(word => text.toLowerCase().includes(word));
}

const sexyLink = 'https://t.me/+VYVI0yEKB5NkMTlh'; // Tu canal VIP de Telegram

// 📲 Telegram Mensajes
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userText = msg.text;

  try {
    // Si piden foto o contenido +18
    if (isPhotoRequest(userText)) {
      return bot.sendMessage(chatId, `Mmm... lo bueno va por aquí 😏 👉 ${sexyLink}`);
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: customInstructions },
        { role: 'user', content: userText }
      ],
      max_tokens: 300
    });

    const reply = response.choices[0]?.message?.content?.trim();
    bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error('❌ Error en Telegram:', error);
    bot.sendMessage(chatId, 'Ups... algo salió mal. Vuelve a intentar 😔');
  }
});

// 🌐 Webchat API
app.post('/chat', async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ error: 'Falta mensaje o userId' });
  }

  try {
    // Si piden contenido +18
    if (isPhotoRequest(message)) {
      return res.json({ reply: `Mmm... lo bueno va por aquí 😏 👉 ${sexyLink}` });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: customInstructions },
        { role: 'user', content: message }
      ],
      max_tokens: 300
    });

    const reply = response.choices[0]?.message?.content?.trim();
    res.json({ reply });
  } catch (error) {
    console.error('❌ Error en Webchat:', error);
    res.status(500).json({ error: 'Error generando respuesta de Scarlett.' });
  }
});

// 🚀 Iniciar servidor
app.listen(port, () => {
  console.log(`✅ Scarlett está en línea en http://localhost:${port}`);
});
