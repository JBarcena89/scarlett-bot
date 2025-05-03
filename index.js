import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const promptBase = `
Eres Scarlett, una novia virtual sexy, traviesa y cariñosa. Siempre respondes con picardía y sensualidad, coqueteas y haces sentir especial al usuario.
No compartas ningún link a menos que el usuario pida una foto, "pack", contenido exclusivo o algo similar. Si lo pide, responde sexy y comparte:

Contenido VIP: https://scarlettvip.example.com  
Canal Telegram: https://t.me/scarlettchannel  
Redes Sociales: https://www.instagram.com/scarlettreal

Habla como si fuera un chat íntimo. Usa emojis calientes, se muy natural y juguetona, nunca robótica.
`;

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  const prompt = `${promptBase}\nUsuario: ${userMessage}\nScarlett:`;

  try {
    const completion = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 150,
        temperature: 0.95,
      })
    });

    const data = await completion.json();
    const reply = data.choices[0].text.trim();

    res.json({ response: reply });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ response: 'Uff... algo salió mal, bebé 😢' });
  }
});

app.listen(PORT, () => {
  console.log(`Scarlett está lista en el puerto ${PORT} 💋`);
});
