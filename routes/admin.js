import express from "express";
import Click from "../models/Click.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area", charset="UTF-8"');
    return res.status(401).send('Autenticación requerida');
  }

  const base64Credentials = auth.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area", charset="UTF-8"');
  return res.status(401).send('Credenciales inválidas');
};

router.use(authMiddleware);

router.get("/", (req, res) => {
  res.sendFile("admin.html", { root: "./public" });
});

router.get("/stats", async (req, res) => {
  try {
    const [clicks, users, conversations] = await Promise.all([
      Click.find({}),
      User.countDocuments(),
      Conversation.countDocuments()
    ]);

    const buttonStats = {};
    const platformStats = {};
    const uniqueUsers = new Set();

    clicks.forEach((click) => {
      buttonStats[click.button] = (buttonStats[click.button] || 0) + 1;
      platformStats[click.platform] = (platformStats[click.platform] || 0) + 1;
      uniqueUsers.add(click.userId);
    });

    res.json({
      buttons: buttonStats,
      platforms: platformStats,
      totalUsers: users,
      activeUsers: uniqueUsers.size,
      totalConversations: conversations
    });
  } catch (err) {
    console.error("Error obteniendo estadísticas:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;
