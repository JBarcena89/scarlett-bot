const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const fetch = require('node-fetch');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const chatHistories = {};

module.exports = (app) => {
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!chatHistories[chatId]) chatHistories[chatId] = [];

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
          messages: chatHistories[chatId],
          temperature: 0.8
        })
      });

      const data = await response.json();
      const reply = data.choices[0].message.content;
      chatHistories[chatId].push({ role: 'assistant', content: reply });
      bot.sendMessage(chatId, reply);
    } catch (error) {
      console.error('Error:', error);
      bot.sendMessage(chatId, 'Oops, amor... algo salió mal. Intenta otra vez 💔.');
    }
  });
};
