import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  // Primero definimos el token, tomando de las cookies o de los headers
  const token = req.cookies.token || req.headers['authorization']; // Tomamos el token de las cookies o de los headers de la petición
  
  // Imprimimos el valor de token, cookies y headers para verificar
  console.log("Cookies recibidas:", req.cookies);
  console.log("Headers recibidos:", req.headers);
  console.log("Token recibido:", token); // Log para verificar el token

  // Si no encontramos el token, respondemos con un error 401
  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  try {
    // Verificamos si el token es válido usando JWT
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);
    req.user = decoded; // Agregamos el usuario decodificado al objeto request
    console.log("Valor de req.user en authenticateToken: ", req.user);
    
    // Si todo está bien, pasamos al siguiente middleware o controlador
    next();
  } catch (err) {
    // Si el token está expirado, mandamos un mensaje específico
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token expired. Please log in again." 
      });
    }

    // Para cualquier otro tipo de error, respondemos con un mensaje general
    res.status(400).json({ 
      message: "Invalid token" 
    });
  }
};

export default authenticateToken;
