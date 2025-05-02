require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());

app.post('/webhook/telegram', async (req, res) => {
    const message = req.body.message?.text;
    const chatId = req.body.message?.chat.id;

    if (message && chatId) {
        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }],
            });

            const reply = completion.data.choices[0].message.content;

            const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
            await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: reply })
            });
        } catch (error) {
            console.error(error);
        }
    }

    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.send('Scarlett-bot está en línea 💖');
});

app.listen(port, () => {
    console.log(`Scarlett-bot corriendo en el puerto ${port}`);
});