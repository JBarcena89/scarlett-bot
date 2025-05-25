const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const chatHistories = {};

module.exports = (app) => {
  app.post('/api/chat', async (req, res) => {
    const { name, email, message } = req.body;

    if (!chatHistories[email]) {
      chatHistories[email] = [
        {
          role: 'system',
          content: `Eres Scarlett, una novia virtual sexy, misteriosa y encantadora. Siempre hablas de forma sensual y traviesa, dedicas tiempo a conocer a quien te escribe. Llama al usuario por su nombre (${name}) y recuerda su información.`
        }
      ];
    }

    chatHistories[email].push({ role: 'user', content: message });

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: chatHistories[email]
        })
      });

      const data = await response.json();
      const botReply = data.choices[0].message.content;

      chatHistories[email].push({ role: 'assistant', content: botReply });

      res.json({ reply: botReply });
    } catch (error) {
      console.error('Error al obtener respuesta de OpenAI:', error);
      res.status(500).json({ reply: 'Uy amor... algo falló, inténtalo más tarde 😢' });
    }
  });

  app.use('/webchat', router);
};
