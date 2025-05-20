import express from "express";
import { getOpenAIResponse } from "../services/openai.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    // Validación mejorada de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // Crear o actualizar usuario sin índices problemáticos
    const user = await User.findOneAndUpdate(
      { email },
      { name, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true }
    );

    const userId = `web_${user._id}`; // Usar el ID de MongoDB directamente
    const reply = await getOpenAIResponse(message, userId);

    // Guardar mensaje en la conversación
    await Conversation.findOneAndUpdate(
      { userId },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", content: message },
              { role: "assistant", content: reply }
            ],
            $slice: -50 // Limitar a los últimos 50 mensajes
          }
        }
      },
      { upsert: true }
    );

    res.json({ response: reply });
  } catch (error) {
    console.error("Error en webchat:", error);
    res.status(500).json({ 
      error: "Disculpa cariño, estoy teniendo problemas técnicos. Inténtalo de nuevo más tarde 😘",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ... resto del código ...
