import express from 'express';
import whatsappWebhook from '../services/whatsappWebhook.js';
import winston from 'winston';

const router = express.Router();
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'whatsapp.log' })
  ]
});

// Verificación del webhook
router.get('/', (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    logger.info('Webhook de WhatsApp verificado');
    res.status(200).send(challenge);
  } else {
    logger.warn('Intento de verificación fallido');
    res.sendStatus(403);
  }
});

// Manejo de mensajes
router.post('/', whatsappWebhook);

export default router;
