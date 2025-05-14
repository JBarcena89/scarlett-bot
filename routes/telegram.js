// routes/telegram.js
const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  res.send("🟢 Endpoint Telegram activo (solo para test)");
});

module.exports = router;
