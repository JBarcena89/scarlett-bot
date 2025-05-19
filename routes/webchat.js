import express from "express";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js"; // Asegúrate de importar esto
import { getOpenAIResponse } from "../services/openai.js"; // Corrige el path

const router = express.Router();

// Guardar mensaje y responder
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email });
  }

  const userId = `web_${email}`;
  const reply = await getOpenAIResponse(message, userId);

  // Guardar mensajes
  await Conversation.create({ userId, sender: "user", message });
  await Conversation.create({ userId, sender: "scarlett", message: reply });

  res.json({ response: reply });
});

// Obtener historial
router.get("/history/:email", async (req, res) => {
  const email = req.params.email;
  const userId = `web_${email}`;

  try {
    const history = await Conversation.find({ userId }).sort({ timestamp: 1 });
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar historial" });
  }
});

export default router;
