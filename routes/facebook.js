const express = require("express");
const router = express.Router();

// Aquí iría la lógica para Facebook Webhooks
router.get("/", (req, res) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado.");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post("/", (req, res) => {
  res.send("Facebook Webhook recibido.");
});

module.exports = router;
// routes/facebook.js
