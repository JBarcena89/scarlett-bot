import express from "express";
import whatsappWebhook from "../services/whatsappWebhook.js";
import securityMiddleware from "../services/securityMiddleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post("/", securityMiddleware, whatsappWebhook);

export default router;
