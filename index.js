const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const iniciarTelegramBot = require("./services/telegramBot");

const webchatRoutes = require("./routes/webchat");
const telegramRoutes = require("./routes/telegram");
const facebookRoutes = require("./routes/facebook");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/chat", webchatRoutes);
app.use("/telegram", telegramRoutes);
app.use("/facebook", facebookRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

console.log("🔧 MONGODB_URI:", process.env.MONGODB_URI ? "✅ definida" : "❌ no definida");

// Iniciar el bot de Telegram
iniciarTelegramBot();
