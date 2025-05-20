import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import winston from 'winston';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({ filename: 'telegram.log' })
  ]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  webHook: {
    port: process.env.PORT || 3000
  },
  polling: process.env.NODE_ENV === 'development'
});

// Configuración del webhook
const setupWebhook = async () => {
  try {
    const webhookUrl = `${process.env.DOMAIN}/telegram/webhook`;
    await bot.setWebHook(webhookUrl);
    logger.info(`Webhook configurado en ${webhookUrl}`);
  } catch (error) {
    logger.error('Error configurando webhook:', error);
  }
};

setupWebhook();

// Middleware para actualizar última actividad
const updateUserActivity = async (userId) => {
  await User.updateOne(
    { _id: userId },
    { $set: { lastActive: new Date() } }
  );
};

// Procesamiento de mensajes
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    if (!text || text.startsWith('/')) return;

    // Indicar que está escribiendo
    await bot.sendChatAction(chatId, 'typing');

    // Retardo artificial
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Buscar o crear usuario
    const user = await User.findOneAndUpdate(
      { telegramId: chatId.toString() },
      {
        $setOnInsert: {
          telegramId: chatId.toString(),
          name: msg.from.first_name || 'Usuario',
          email: ''
        }
      },
      { upsert: true, new: true }
    );

    // Actualizar conversación
    const conversation = await Conversation.findOneAndUpdate(
      { userId: user._id },
      { $setOnInsert: { userId: user._id, messages: [] } },
      { upsert: true, new: true }
    );

    // Agregar mensaje de usuario
    conversation.messages.push({
      role: 'user',
      content: text,
      timestamp: new Date()
    });

    // Obtener respuesta de OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Eres Scarlett, una novia virtual coqueta y divertida. Responde con tono sensual pero elegante.'
        },
        ...conversation.messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      ],
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;

    // Guardar respuesta y actualizar
    conversation.messages.push({
      role: 'assistant',
      content: reply,
      timestamp: new Date()
    });

    await conversation.save();
    await updateUserActivity(user._id);

    // Enviar respuesta
    await bot.sendMessage(chatId, reply);

  } catch (error) {
    logger.error('Error procesando mensaje:', error);
    await bot.sendMessage(chatId, 'Ups, algo salió mal. Inténtalo de nuevo, amor 😘');
  }
});

// Comandos
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(
    chatId,
    `👋 Hola ${msg.from.first_name}! Soy Scarlett, tu novia virtual.\n\n` +
    `Puedes hablar conmigo libremente o usar estos comandos:\n` +
    `/help - Muestra esta ayuda\n` +
    `/reset - Reinicia nuestra conversación`
  );
});

export default bot;
