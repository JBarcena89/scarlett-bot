// routes/telegram.js
import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  res.send("🟢 Endpoint Telegram activo (solo para test)");
});

export default router;
