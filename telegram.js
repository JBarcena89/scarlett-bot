const express = require('express');
const router = express.Router();
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const fetch = require('node-fetch');

// Usa webhook en lugar de polling
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { webHook: { port: false } });

// Establece el webhook con tu URL de producción
const WEBHOOK_URL = `${process.env.BASE_URL}/telegram/webhook`; // Asegúrate de tener BASE_URL en tu .env
bot.setWebHook(WEBHOOK_URL);

const chatHistories = {};

module.exports = (app) => {
  // Ruta que Telegram usará para enviar mensajes
  app.post('/telegram/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!chatHistories[chatId]) {
      chatHistories[chatId] = [];
    }

    chatHistories[chatId].push({ role: 'user', content: userMessage });

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: chatHistories[chatId]
        })
      });

      const data = await response.json();
      const botReply = data.choices[0].message.content;

      chatHistories[chatId].push({ role: 'assistant', content: botReply });

      bot.sendMessage(chatId, botReply);
    } catch (error) {
      console.error('Error fetching OpenAI response:', error);
      bot.sendMessage(chatId, 'Oops, algo salió mal. Inténtalo de nuevo más tarde.');
    }
  });

  app.use('/telegram', router);
};
