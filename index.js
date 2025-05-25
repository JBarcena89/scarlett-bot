require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const DOMAIN = process.env.DOMAIN;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3000;

if (!DOMAIN || !TOKEN || !OPENAI_API_KEY) {
  console.error('Faltan variables de entorno: DOMAIN, TELEGRAM_BOT_TOKEN, OPENAI_API_KEY');
  process.exit(1);
}

const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const userHistory = {};

const bot = new TelegramBot(TOKEN, { webHook: true });
bot.setWebHook(`${DOMAIN}/bot${TOKEN}`);

app.post(`/bot${TOKEN}`, (req, res) => {
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
      content: 'Eres Scarlett, una inteligencia artificial que actúa como la novia virtual del usuario. Recuerda las conversaciones anteriores y responde siempre con un tono coqueto, cariñoso y sexy en español.'
    }];
  }

  userHistory[userKey].push({ role: 'user', content: text });

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: userHistory[userKey]
    });
    const reply = response.data.choices[0].message.content;
    userHistory[userKey].push({ role: 'assistant', content: reply });
    bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error OpenAI (Telegram):', error);
    bot.sendMessage(chatId, 'Lo siento, ocurrió un error al generar la respuesta.');
  }
});

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
      content: 'Eres Scarlett, una inteligencia artificial que actúa como la novia virtual del usuario. Recuerda las conversaciones anteriores y responde siempre con un tono coqueto, cariñoso y sexy en español.'
    }];
  }

  userHistory[userKey].push({ role: 'user', content: message });

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: userHistory[userKey]
    });
    const reply = response.data.choices[0].message.content;
    userHistory[userKey].push({ role: 'assistant', content: reply });
    res.json({ reply });
  } catch (error) {
    console.error('Error OpenAI (Web):', error);
    res.status(500).json({ error: 'Error al generar respuesta de Scarlett.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});
