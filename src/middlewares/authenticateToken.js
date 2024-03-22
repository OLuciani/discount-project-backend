import jwt from 'jsonwebtoken';

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

export default authenticateToken;