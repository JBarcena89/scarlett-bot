// ... imports ...

// Configuración mejorada del bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  webHook: true,
  polling: process.env.NODE_ENV !== 'production' // Solo polling en desarrollo
});

// Configurar webhook inmediatamente
bot.setWebHook(`${process.env.DOMAIN}/telegram/webhook`)
  .then(() => console.log("✅ Webhook de Telegram configurado correctamente"))
  .catch(err => console.error("❌ Error configurando webhook:", err));

// Manejo mejorado de mensajes
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Indicar que está escribiendo
    await bot.sendChatAction(chatId, "typing");
    
    // Retardo artificial de 3-5 segundos
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
    
    // Resto de la lógica de procesamiento...
    const text = msg.text;
    let user = await User.findOneAndUpdate(
      { telegramId: chatId.toString() },
      { 
        $setOnInsert: { 
          telegramId: chatId.toString(),
          name: msg.from.first_name || "Usuario",
          email: ""
        }
      },
      { upsert: true, new: true }
    );

    // ... resto del código de procesamiento ...

    // Enviar respuesta
    await bot.sendMessage(chatId, reply);
    
  } catch (error) {
    console.error("Error en Telegram:", error);
    await bot.sendMessage(chatId, "Ups, algo salió mal. Inténtalo de nuevo más tarde, cariño 😘");
  }
});
