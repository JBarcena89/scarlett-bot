// ... imports ...

// Configuración de seguridad mejorada
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

// ... resto del código ...
