require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  const systemPrompt = `Eres Scarlett, una novia 24/7 sexy, atrevida y juguetona. Responde con picardía, sin ser vulgar. Coquetea, haz sentir especial al usuario y recuerda incluir de vez en cuando estos enlaces:\n\n💖 Contenido VIP: https://fanlove.mx/scarlettWilson363\n📢 Telegram: https://t.me/+lONk_D-rSyFiNDkx\n🌐 Redes Sociales: https://www.atom.bio/scarlettwilson363`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();
    const botReply = data.choices[0].message.content;

    // Simula demora de 3 a 5 segundos aleatoria
    const delay = Math.floor(Math.random() * 2000) + 3000;
    setTimeout(() => res.json({ reply: botReply }), delay);

  } catch (err) {
    res.status(500).json({ error: 'Error al conectar con OpenAI.' });
  }
});

app.listen(PORT, () => console.log(`Scarlett está viva en el puerto ${PORT} 💖`));
