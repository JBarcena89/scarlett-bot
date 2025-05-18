import express from "express";
import User from "../models/User.js";
import { getOpenAIResponse } from "./openai.js";
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) return res.status(400).json({ error: "Faltan datos" });

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email });
  }

  const userId = `web_${email}`;
  const reply = await getOpenAIResponse(message, userId);

  res.json({ reply });
});

export default router;
