import jwt from 'jsonwebtoken';

const authenticateConfirmEmailToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
 // Asumiendo que el token se envía en el encabezado Authorization
    console.log("Token recibido:", token);
  
    if (!token) {
      return res.status(401).json({ message: "Access denied, no token provided" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.CONFIRM_EMAIL_SECRET); // Usar un secret específico para este token
      req.user = decoded;
      next();
    } catch (err) {
        console.log("Error verificando token:", err); 
      res.status(400).json({ message: "Invalid or expired reset token" });
    }
  };
  
  export default authenticateConfirmEmailToken;