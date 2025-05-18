import express from "express";
import { getOpenAIResponse } from "./openai.js";
import User from "../models/User.js";
import fetch from "node-fetch"; // ⬅️ Necesario

const router = express.Router();

router.post("/", async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (!message || message.type !== "text") return res.sendStatus(200);

  const from = message.from;
  const text = message.text.body;

  let user = await User.findOne({ whatsappId: from });
  if (!user) {
    user = await User.create({ whatsappId: from, name: "WhatsUser", email: "" });
  }

  const userId = `wa_${from}`; // ✅ corrección
  const reply = await getOpenAIResponse(text, userId);

  await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: from,
      text: { body: reply },
    }),
  });

  res.sendStatus(200);
});

export default router;
