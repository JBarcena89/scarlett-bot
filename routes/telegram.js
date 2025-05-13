const express = require("express");
const router = express.Router();

// Puedes integrar aquí lógica con node-telegram-bot-api u otra
router.post("/", (req, res) => {
  res.send("Telegram endpoint activo");
});

module.exports = router;
