// routes/webchat.js
import express from "express";
import { getOpenAIResponse } from "../services/openai.js";
import User from "../models/User.js";
import Click from "../models/Click.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const reply = await getOpenAIResponse(message, userId);
    res.json({ response: reply });
  } catch (err) {
    console.error("Error al obtener respuesta:", err);
    res.status(500).json({ error: "Error al responder" });
  }
});

router.post("/click", async (req, res) => {
  const { userId, button } = req.body;

  if (!userId || !button) {
    return res.status(400).json({ error: "Faltan datos de clic" });
  }

  try {
    await Click.create({ userId, button });
    res.sendStatus(200);
  } catch (err) {
    console.error("Error registrando clic:", err);
    res.sendStatus(500);
  }
});

router.post("/track", async (req, res) => {
  const { buttonName, email } = req.body;

  if (!buttonName || !email) {
    return res.status(400).json({ error: "Faltan datos de tracking" });
  }

  try {
    const userId = `${email}_manual`;
    await Click.create({ userId, button: buttonName });
    res.sendStatus(200);
  } catch (err) {
    console.error("Error registrando clic manual:", err);
    res.sendStatus(500);
  }
});

export default router;
