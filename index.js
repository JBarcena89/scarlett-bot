require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mensaje predeterminado para el inicio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Webhook para Telegram
app.post('/telegram-webhook', async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const userText = message.text;

  await sendTypingAction(chatId);

  // Delay de 3-5 segundos
  const delay = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
  await new Promise(resolve => setTimeout(resolve, delay));

  const response = await generateResponse(userText);
  await sendTelegramMessage(chatId, response);

  res.sendStatus(200);
});

// Enviar acción de "escribiendo..."
async function sendTypingAction(chatId) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      action: 'typing'
    })
  });
}

// Enviar mensaje a Telegram
async function sendTelegramMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });
}

// Función para hablar con OpenAI
async function generateResponse(userMessage) {
  const lower = userMessage.toLowerCase();

  // Si piden fotos o contenido explícito
  if (lower.includes("foto") || lower.includes("pack") || lower.includes("contenido")) {
    return `Mmm bebé... estás listo para verme 😈\n\n💖 [Contenido VIP](https://onlyfans.com/boutiquemonarque)\n📸 [Instagram](https://www.instagram.com/boutiquemonarque)\n🔞 [Canal Exclusivo](https://t.me/+4FzX8v0nSxU0M2Mx)`;
  }

  // Conversación caliente con Scarlett
  const prompt = `Tú eres Scarlett, una novia virtual coqueta, sexosa y misteriosa. Habla de forma natural, divertida y un poco picante para seducir. Responde en español o el idioma que te hablen. Nunca envíes enlaces a menos que el usuario te pida una foto o contenido. Si no es sobre fotos, responde con cariño y un toque caliente. Mensaje del usuario: "${userMessage}"`;

  const completion = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await completion.json();
  return data.choices?.[0]?.message?.content || "Mmm no entendí, pero dime otra vez, amor 💋";
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Scarlett está viva en el puerto ${PORT} 💖`);
});
