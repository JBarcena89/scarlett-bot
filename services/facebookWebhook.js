import express from "express";
import { getOpenAIResponse } from "./openai.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";

const router = express.Router();

router.get("/", (req, res) => {
  const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post("/", async (req, res) => {
  const entry = req.body.entry?.[0];
  const messaging = entry?.messaging?.[0];

  if (!messaging?.sender?.id || !messaging?.message?.text) return res.sendStatus(400);

  const senderId = messaging.sender.id;
  const message = messaging.message.text;

  let user = await User.findOne({ facebookId: senderId });
  if (!user) {
    user = await User.create({ facebookId: senderId, name: "FBUser", email: "" });
  }

  const userId = `fb_${senderId}`;
  const reply = await getOpenAIResponse(message, userId);

  await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${process.env.FB_PAGE_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: { text: reply },
    }),
  });

  res.sendStatus(200);
});

export default router;
