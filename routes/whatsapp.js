import express from 'express';
import whatsappWebhook from '../services/whatsappWebhook.js';
import winston from 'winston';

const router = express.Router();
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/whatsapp.log' })
  ]
});

// Verificación del webhook
router.get('/', (req, res) => {
  try {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
      logger.info('Webhook de WhatsApp verificado correctamente');
      return res.status(200).send(challenge);
    }
    
    logger.warn('Intento de verificación fallido - Token incorrecto');
    return res.sendStatus(403);
  } catch (error) {
    logger.error('Error en verificación de WhatsApp:', error);
    return res.sendStatus(500);
  }
});

// Manejo de mensajes entrantes
router.post('/', whatsappWebhook);

export default router;
