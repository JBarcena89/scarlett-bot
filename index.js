import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import iniciarTelegramBot from "./services/telegramBot.js";

import webchatRoutes from "./routes/webchat.js";
import telegramRoutes from "./routes/telegram.js";
import facebookRoutes from "./routes/facebook.js";
import adminRoutes from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/chat", webchatRoutes);
app.use("/telegram", telegramRoutes);
app.use("/facebook", facebookRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

console.log("🔧 MONGODB_URI:", process.env.MONGODB_URI ? "✅ definida" : "❌ no definida");

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Conectado a MongoDB");
  iniciarTelegramBot(); // solo iniciamos el bot después de conectar DB
}).catch((err) => {
  console.error("❌ Error al conectar a MongoDB:", err);
});
