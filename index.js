const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const OpenAI = require('openai'); // Actualizado para openai@4.x
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// OpenAI Client (v4)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

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
const sexyReply = `Mmm… solo en mi canal VIP, amor 👉 [entra aquí](${sexyLink}) 😘🔥`;

// Lógica de mensaje de Telegram
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userInput = msg.text;

  // Si es una solicitud de contenido sexy, responde con el link directo
  if (isPhotoRequest(userInput)) {
    return bot.sendMessage(chatId, sexyReply, { parse_mode: 'Markdown' });
  }

  bot.sendChatAction(chatId, 'typing'); // Mostrar "escribiendo..."

  if (!userHistory[chatId]) {
    userHistory[chatId] = [];
  }

  if (!userIntroSent.has(chatId)) {
    bot.sendMessage(chatId, "Hola amor 😘 Soy Scarlett, tu novia virtual... ¿en qué estás pensando? 😈");
    userIntroSent.add(chatId);
  }

  userHistory[chatId].push({ role: 'user', content: userInput });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: customInstructions },
        ...userHistory[chatId]
      ],
      temperature: 0.9
    });

    const response = completion.choices[0].message.content;
    userHistory[chatId].push({ role: 'assistant', content: response });

    bot.sendMessage(chatId, response);
  } catch (error) {
    console.error('Error con OpenAI:', error.message);
    bot.sendMessage(chatId, "Uy amor... algo falló. ¿Me repites eso?");
  }
});

app.listen(port, () => {
  console.log(`Servidor de Scarlett activo en el puerto ${port}`);
});
