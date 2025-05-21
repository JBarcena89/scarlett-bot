// telegram.js
const fetch = require('node-fetch');
require('dotenv').config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Función para enviar un mensaje de Scarlett a Telegram
async function sendToTelegram(message) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Faltan TELEGRAM_TOKEN o TELEGRAM_CHAT_ID en el archivo .env');
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('Error al enviar mensaje a Telegram:', await response.text());
    }
  } catch (error) {
    console.error('Error de conexión con Telegram:', error);
  }
}

module.exports = { sendToTelegram };
