import express from 'express';
import { getOpenAIResponse } from './openai.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import fetch from 'node-fetch';
import winston from 'winston';

const router = express.Router();
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/whatsapp-webhook.log' })
  ]
});

router.post('/', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    // Validar mensaje entrante
    if (!message || message.type !== 'text') {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text.body;
    logger.info(`Mensaje de WhatsApp recibido de ${from}: ${text}`);

    // Buscar o crear usuario
    const user = await User.findOneAndUpdate(
      { whatsappId: from },
      { 
        $setOnInsert: { 
          whatsappId: from, 
          name: `WhatsApp-${from.slice(-4)}`,
          email: ''
        },
        $set: { lastActive: new Date() }
      },
      { upsert: true, new: true }
    );

    const userId = `wa_${user._id}`;
    logger.info(`Procesando mensaje para usuario ${userId}`);

    // Obtener respuesta de OpenAI
    const reply = await getOpenAIResponse(text, userId);
    logger.info(`Respuesta generada para ${from}: ${reply.substring(0, 50)}...`);

    // Enviar respuesta a WhatsApp
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: from,
          type: 'text',
          text: { body: reply }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      logger.error('Error al enviar a WhatsApp:', errorData);
      throw new Error('Error en API de WhatsApp');
    }

    logger.info(`Respuesta enviada exitosamente a ${from}`);
    res.sendStatus(200);
  } catch (error) {
    logger.error('Error en webhook de WhatsApp:', error);
    res.sendStatus(500);
  }
});

export default router;
