const fetch = require('node-fetch');

module.exports = (app) => {
  const chatHistories = {};

  app.post('/api/message', async (req, res) => {
    const { name, email, message } = req.body;
    const userId = `${name.toLowerCase()}-${email.toLowerCase()}`;

    if (!chatHistories[userId]) {
      chatHistories[userId] = [
        {
          role: 'system',
          content: `Eres Scarlett, una novia virtual sexy, misteriosa y divertida. Te gusta coquetear, recordar a cada usuario por su nombre, y hacerlos sentir especiales. El usuario se llama ${name}.`
        }
      ];
    }

    chatHistories[userId].push({ role: 'user', content: message });

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: chatHistories[userId],
          temperature: 0.85
        })
      });

      const data = await response.json();
      const reply = data.choices[0].message.content;
      chatHistories[userId].push({ role: 'assistant', content: reply });

      res.json({ reply });
    } catch (error) {
      console.error('Error al contactar OpenAI:', error);
      res.status(500).json({ error: 'Scarlett está ocupada... pero vuelve pronto 💋.' });
    }
  });
};
