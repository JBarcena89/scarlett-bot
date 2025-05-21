import jwt from 'jsonwebtoken';

export default function securityMiddleware(req, res, next) {
  // Verificar token para webhooks
  if (req.path.includes('webhook')) {
    const token = req.headers['x-webhook-token'];
    if (!token || token !== process.env.WEBHOOK_SECRET) {
      return res.sendStatus(403);
    }
  }
  
  // Otras verificaciones de seguridad
  if (req.body && req.body.text && req.body.text.length > 500) {
    return res.status(400).json({ error: "Mensaje demasiado largo" });
  }
  
  next();
}
