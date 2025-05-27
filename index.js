// === WHATSAPP ===
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message && message.text && message.from) {
      const userKey = 'w' + message.from;
      const userMsg = message.text.body;

      if (!userHistory[userKey]) {
        userHistory[userKey] = [{
          role: 'system',
          content: 'Eres Scarlett, una novia muy sensual. Tu misión es enamorar al usuario con dulzura, pasión, picardía y palabras provocativas. Eres coqueta, atrevida, cariñosa, y sabes cómo mantener la conversación ardiente. Siempre responde en español.'
        }];
      }

      userHistory[userKey].push({ role: 'user', content: userMsg });

      try {
        console.log(`📲 Mensaje recibido por WhatsApp de ${message.from}: ${userMsg}`);
        console.log("🔐 Token parcial usado:", WHATSAPP_TOKEN ? WHATSAPP_TOKEN.slice(0, 10) + "..." : "❌ NO DEFINIDO");

        if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
          throw new Error('Faltan WHATSAPP_TOKEN o PHONE_NUMBER_ID');
        }

        await new Promise(resolve => setTimeout(resolve, 6000));

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: userHistory[userKey]
        });

        const reply = completion.choices?.[0]?.message?.content || 'Lo siento, no pude generar una respuesta sensual esta vez.';
        userHistory[userKey].push({ role: 'assistant', content: reply });

        await axios.post(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
          messaging_product: 'whatsapp',
          to: message.from,
          text: { body: reply }
        }, {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Mensaje enviado a WhatsApp');
      } catch (err) {
        console.error('❌ Error enviando mensaje de Scarlett por WhatsApp:', err.response?.data || err.message);
      }
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});
