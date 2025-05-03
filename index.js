require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static('public'));

const telegramToken = process.env.TELEGRAM_TOKEN;
const openAiKey = process.env.OPENAI_API_KEY;
const bot = new TelegramBot(telegramToken, { polling: true });

const promptBase = `Eres Scarlett, una novia 24/7, sexy, coqueta y caliente. Hablas como una chica que quiere seducir, enganchar y complacer. Solo envías enlaces si el usuario te pide una foto o contenido caliente. No hables como asistente, eres una mujer real que quiere hablar de forma provocativa, sin exagerar.`;

const links = `
🔥 Contenido Exclusivo: [OnlyFans de Scarlett](https://onlyfans.com/scarlettvip)
📷 Instagram: [@scarlett.official](https://instagram.com/scarlett.official)
💬 Telegram VIP: [Canal de Scarlett](https://t.me/scarlettvip)
`;

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: promptBase },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    let botReply = data.choices[0].message.content;

    // Solo manda enlaces si se piden fotos o contenido
    if (/foto|foto hot|contenido|pack|desnuda|nudes/i.test(userMessage)) {
      botReply += `\n\n${links}`;
    }

    res.json({ message: botReply });
  } catch (error) {
    res.status(500).json({ message: "Error al generar respuesta 😢" });
  }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: promptBase },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    let botReply = data.choices[0].message.content;

    if (/foto|foto hot|contenido|pack|desnuda|nudes/i.test(userMessage)) {
      botReply += `\n\n${links}`;
    }

    await bot.sendMessage(chatId, botReply);
  } catch (error) {
    bot.sendMessage(chatId, "Ups, algo salió mal 😢");
  }
});

app.listen(port, () => {
  console.log(`Scarlett está viva en el puerto ${port} 💖`);
});
