import jwt from 'jsonwebtoken';

const authenticateCreateBusinessManager = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
 // Asumiendo que el token se envía en el encabezado Authorization
    console.log("Token recibido:", token);
  
    if (!token) {
      return res.status(401).json({ message: "Acceso denegado, no se proporciona ningún token" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.CREATE_EXTRA_BUSINESS_ADMIN_USER_SECRET); // Usar un secret específico para este token
      req.user = decoded;
      next();
    } catch (err) {
        console.log("Error verificando token:", err); 
      res.status(400).json({ message: "Token p/crear usuario administrador de cuenta de negocio Inválido o expirado" });
    }
  };
  
  export default authenticateCreateBusinessManager;