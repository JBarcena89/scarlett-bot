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

    let user = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: { name, email, createdAt: new Date() } },
      { upsert: true, new: true }
    );

    const userId = `web_${email}`;
    const reply = await getOpenAIResponse(message, userId);

    await Conversation.findOneAndUpdate(
      { userId },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", content: message },
              { role: "assistant", content: reply }
            ]
          }
        }
      },
      { upsert: true }
    );

    res.json({ response: reply });
  } catch (error) {
    console.error("Error en webchat:", error);
    res.status(500).json({ error: "Error al procesar tu mensaje" });
  }
});

router.get("/history/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const userId = `web_${email}`;
    const conversation = await Conversation.findOne({ userId });
    
    if (!conversation) {
      return res.json([]);
    }

    res.json(conversation.messages);
  } catch (err) {
    console.error("Error al cargar historial:", err);
    res.status(500).json({ error: "Error al cargar historial" });
  }
});

export default router;
