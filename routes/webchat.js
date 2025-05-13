const express = require("express");
const router = express.Router();
const { getOpenAIResponse } = require("../services/openai");
const User = require("../models/User");
const Click = require("../models/Click");

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

router.post("/click", async (req, res) => {
  const { userId, button } = req.body;
  try {
    await Click.create({ userId, button });
    res.sendStatus(200);
  } catch (err) {
    console.error("Error registrando clic:", err);
    res.sendStatus(500);
  }
});

module.exports = router;
// routes/webchat.js
