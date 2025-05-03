
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
  let finalPrompt = `Habla como una novia 24/7, muy coqueta, con tono sexoso y atrevido. 
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

app.listen(port, () => {
  console.log(`Scarlett está viva en el puerto ${port} 💖`);
});
