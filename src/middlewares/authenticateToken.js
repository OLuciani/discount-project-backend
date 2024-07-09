/* import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
    console.log('Middleware authenticateToken llamado.');

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    console.log("Valor recibido del token:", token);

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, 'mi_secreto_secreto', (err, user) => {
        if (err) {
            console.error("Error al verificar el token:", err);
            return res.status(403).json({ message: 'Token inválido' });
        }

        // Agrega el usuario decodificado al objeto de solicitud para que esté disponible en los controladores
        req.user = user;
        next();
    });
};

export default authenticateToken; */



import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, 'mi_secreto_secreto');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

export default authenticateToken;

