import jwt from 'jsonwebtoken';

const authenticateCreateBusinessEmployee = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
 // Asumiendo que el token se envía en el encabezado Authorization
    console.log("Token recibido:", token);
  
    if (!token) {
      return res.status(401).json({ message: "Acceso denegado, no se proporciona ningún token" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.CREATE_USER_QR_SCANNER_SECRET); // Usar un secret específico para este token
      req.user = decoded;
      next();
    } catch (err) {
      // Manejo específico del error de token expirado
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ 
          message: "Token expired. Please log in again." 
        });
      }

      console.log("Error verificando token:", err); 
      res.status(400).json({ message: "Token para crear usuario con rol de empleado de un negocio Inválido o expirado" });
    }
  };
  
  export default authenticateCreateBusinessEmployee;