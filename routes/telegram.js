// routes/telegram.js
import express from "express";
import bot from "../services/telegramBot.js";

const router = express.Router();

// Telegram enviará mensajes a esta ruta
router.post("/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

export default router;
