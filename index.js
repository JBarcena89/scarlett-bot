// index.js
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

import webchatRoutes from "./routes/webchat.js";
import telegramRoutes from "./routes/telegram.js";
import facebookRoutes from "./routes/facebook.js";
import adminRoutes from "./routes/admin.js";

// Nuevas integraciones
import facebookWebhook from "./services/facebookWebhook.js";
import whatsappWebhook from "./services/whatsappWebhook.js";

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json()); // Asegura que Telegram procese el body correctamente
app.use(express.static(path.join(__dirname, "public")));

// Rutas
app.use("/chat", webchatRoutes);
app.use("/telegram", telegramRoutes);
app.use("/facebook", facebookRoutes);
app.use("/admin", adminRoutes);
app.use("/webhook/facebook", facebookWebhook);
app.use("/webhook/whatsapp", whatsappWebhook);

// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Verifica si la variable de entorno está definida
console.log("🔧 MONGODB_URI:", process.env.MONGODB_URI ? "✅ definida" : "❌ no definida");
console.log("🔧 DOMAIN:", process.env.DOMAIN ? "✅ definida" : "❌ no definida");

// Conexión a MongoDB y arranque del servidor
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ Conectado a MongoDB");
}).catch((err) => {
  console.error("❌ Error al conectar a MongoDB:", err);
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
