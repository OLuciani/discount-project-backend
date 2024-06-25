//este es el primer middleware de autenticacion de token que hice y funcionaba re bien
/* import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
    console.log('Middleware authenticateToken llamado.');
  
    const token = req.headers.authorization;
    console.log("Valor recibido del token:", token);
  
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
  
    jwt.verify(token.replace("Bearer ", ""), 'mi_secreto_secreto', (err, user) => {
      if (err) {
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

export default authenticateToken;
