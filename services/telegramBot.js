// ... imports ...

// Configurar webhook inmediatamente sin timeout
bot.setWebHook(`${URL}/telegram/webhook`)
  .then(() => console.log("✅ Webhook de Telegram registrado"))
  .catch(err => console.error("❌ Error registrando webhook:", err));

// Manejo mejorado de errores
bot.on("message", async (msg) => {
  try {
    if (!msg.text || msg.text.length > 500) {
      return bot.sendMessage(msg.chat.id, "Lo siento cariño, solo puedo procesar mensajes de hasta 500 caracteres 😘");
    }

    // ... resto de la lógica ...
    
  } catch (error) {
    console.error("Error en Telegram:", error);
    bot.sendMessage(msg.chat.id, "Ups, algo salió mal. Inténtalo de nuevo, cariño 😘");
  }
});

// Manejar comandos específicos
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Hola amorcito 😘 Soy Scarlett, tu novia virtual. ¿En qué puedo ayudarte hoy?");
});
