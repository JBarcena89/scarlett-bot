const express = require("express");
const router = express.Router();
const { getOpenAIResponse } = require("../services/openai");
const User = require("../models/User");
const Click = require("../models/Click");
const reply = await getOpenAIResponse(message, userId);

router.post("/", async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const reply = await getOpenAIResponse(message);
    res.json({ response: reply });
  } catch (err) {
    console.error("Error al obtener respuesta:", err);
    res.status(500).json({ error: "Error al responder" });
  }
});

// Ruta para guardar clics desde el chat
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

// 📩 Ruta para guardar clics desde botones visibles usando email
router.post("/track", async (req, res) => {
  const { buttonName, email } = req.body;

  if (!buttonName || !email) {
    return res.status(400).json({ error: "Faltan datos de tracking" });
  }

  try {
    const userId = `${email}_manual`; // Se genera userId simple para tracking
    await Click.create({ userId, button: buttonName });
    res.sendStatus(200);
  } catch (err) {
    console.error("Error registrando clic manual:", err);
    res.sendStatus(500);
  }
});

module.exports = router;
