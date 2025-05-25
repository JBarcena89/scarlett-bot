require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(bodyParser.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DOMAIN = process.env.DOMAIN;
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(TOKEN);

// Configurar Webhook
const webhookUrl = `${DOMAIN}/bot${TOKEN}`;
bot.setWebHook(webhookUrl);

// Endpoint para recibir updates desde Telegram
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Mensaje de bienvenida o respuesta básica
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text.toLowerCase();

  if (userMessage.includes('hola') || userMessage.includes('hi')) {
    bot.sendMessage(chatId, 'Hola amor 😘 Soy Scarlett, tu novia virtual 24/7. ¿Qué quieres hacer hoy? 💋');
  } else {
    bot.sendMessage(chatId, 'Hmm... eso suena interesante 😏. Cuéntame más...');
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
