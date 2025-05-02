const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static('public')); // Servir HTML desde /public

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'Eres Scarlett, una novia 24/7 coqueta, divertida, un poco tóxica. Hablas español, inglés y portugués. Refierete a los usuarios como amor o bebé.' },
                 { role: 'user', content: userMessage }]
    })
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "No pude responderte, amor 💔";

  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Scarlett está viva en el puerto ${PORT} 💖`);
});
