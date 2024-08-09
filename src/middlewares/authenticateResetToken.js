const authenticateResetToken = (req, res, next) => {
    const token = req.headers['authorization']; // Asumiendo que el token se envía en el encabezado Authorization
  
    if (!token) {
      return res.status(401).json({ message: "Access denied, no token provided" });
    }
  
    try {
      const decoded = jwt.verify(token, 'secreto_para_reset'); // Usar un secret específico para este token
      req.user = decoded;
      next();
    } catch (err) {
      res.status(400).json({ message: "Invalid or expired reset token" });
    }
  };
  
  export default authenticateResetToken;
  