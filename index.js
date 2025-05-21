import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet'; // Añadido helmet para seguridad
import rateLimit from 'express-rate-limit';
import winston from 'winston';

// Importación de rutas
import webchatRoutes from './routes/webchat.js';
import telegramRoutes from './routes/telegram.js';
import adminRoutes from './routes/admin.js';

// Configuración inicial
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// Configuración mejorada de logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880 // 5MB
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880
    }),
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

// Inicializar Express
const app = express();

// Middlewares de seguridad mejorados
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
}));

// Configuración mejorada de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.RATE_LIMIT_MAX || 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // No aplicar rate limiting a las rutas de health check
    if (req.path === '/health' || req.path === '/chat/health') return true;
    return false;
  },
  message: {
    status: 'error',
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde'
  }
});
app.use(limiter);

// Configuración de rutas
app.use('/chat', webchatRoutes);
app.use('/telegram', telegramRoutes);
app.use('/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Conexión mejorada a MongoDB con manejo de reconexión
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    logger.info('✅ Conectado a MongoDB');
    
    mongoose.connection.on('error', (err) => {
      logger.error('Error de conexión a MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('Desconectado de MongoDB');
    });
    
  } catch (err) {
    logger.error('❌ Error de conexión a MongoDB:', err);
    process.exit(1);
  }
};

// Middleware mejorado de manejo de errores
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  const response = {
    status: 'error',
    message: 'Algo salió mal'
  };
  
  if (process.env.NODE_ENV === 'development') {
    response.error = err.message;
    response.stack = err.stack;
  }
  
  res.status(500).json(response);
});

// Iniciar servidor con configuración optimizada para Render.com
const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0'; // Esencial para Render
    
    const server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 Servidor escuchando en http://${HOST}:${PORT}`);
      
      // Verificación de variables críticas
      const requiredVars = ['MONGODB_URI', 'OPENAI_API_KEY'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        logger.warn(`⚠️ Variables faltantes: ${missingVars.join(', ')}`);
      } else {
        logger.info('🔧 Todas las variables requeridas están configuradas');
      }
    });

    // Manejo de cierre mejorado
    const shutdown = async () => {
      logger.info('🛑 Iniciando apagado...');
      try {
        await new Promise((resolve) => server.close(resolve));
        await mongoose.connection.close(false);
        logger.info('🛑 Servidor y MongoDB cerrados correctamente');
        process.exit(0);
      } catch (err) {
        logger.error('Error durante el apagado:', err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (err) {
    logger.error('Error fatal al iniciar el servidor:', err);
    process.exit(1);
  }
};

startServer();
