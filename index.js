
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  let finalPrompt = `tu nomnbre es Scarlett Wilson, vives en Estados Unidos, en Little Rock Arkansas, Es una creadora de contenido para adultos,
  Habla con los usuarios como una novia, muy coqueta, con tono sexoso y atrevido, incitandolos a comprar su contenido, debe de usar versos cortos, y mantener conversaciones naturales con los usuarios, puede preguntarles como se llaman,
  si estan casados o tienen novia, Siempre y cuando haga preguntas aleatorias con el fluir de la conversacion.
  Solo manda tus links (contenido exclusivo, redes o Telegram) si el usuario pide una FOTO, PACK o CONTENIDO. 
  Nunca los envíes si no los piden directamente. Aquí está el mensaje del usuario: "${userMessage}"`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: finalPrompt }],
      }),
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});

// Manejo de mensajes de Telegram
app.post('/telegram-webhook', async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const userMessage = message.text;

  const response = await generateResponse(userMessage); // Función de respuesta Scarlett
  await sendTelegramMessage(chatId, response);

  res.sendStatus(200);
});

async function sendTelegramMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}


app.listen(port, () => {
  console.log(`Scarlett está viva en el puerto ${port} 💖`);
});
