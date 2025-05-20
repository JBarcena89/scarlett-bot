import express from 'express';
import { getOpenAIResponse } from '../services/openai.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import winston from 'winston';

const router = express.Router();
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'webchat.log' })
  ]
});

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validación de entrada
    if (!name || !email || !message) {
      logger.warn('Faltan datos requeridos');
      return res.status(400).json({ 
        error: 'Por favor proporciona nombre, email y mensaje' 
      });
    }

    if (message.length > 500) {
      logger.warn('Mensaje demasiado largo');
      return res.status(400).json({ 
        error: 'El mensaje no puede exceder 500 caracteres' 
      });
    }

    // Buscar o crear usuario
    const user = await User.findOneAndUpdate(
      { email },
      { 
        name,
        $setOnInsert: { 
          email,
          createdAt: new Date() 
        },
        $set: { lastActive: new Date() }
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true 
      }
    );

    const userId = `web_${user._id}`;
    
    // Obtener respuesta de OpenAI
    const reply = await getOpenAIResponse(message, userId);

    // Guardar conversación
    await Conversation.findOneAndUpdate(
      { userId },
      {
        $push: {
          messages: {
            $each: [
              { 
                role: 'user', 
                content: message,
                timestamp: new Date()
              },
              { 
                role: 'assistant', 
                content: reply,
                timestamp: new Date()
              }
            ],
            $slice: -100 // Limitar a últimos 100 mensajes
          }
        }
      },
      { upsert: true }
    );

    res.json({ response: reply });

  } catch (error) {
    logger.error('Error en webchat:', error);
    res.status(500).json({ 
      error: 'Disculpa, estoy teniendo problemas técnicos. Inténtalo más tarde 😘',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conversation = await Conversation.findOne({ userId: `web_${userId}` });

    if (!conversation) {
      return res.json([]);
    }

    res.json(conversation.messages);
  } catch (error) {
    logger.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error al cargar historial' });
  }
});

export default router;
