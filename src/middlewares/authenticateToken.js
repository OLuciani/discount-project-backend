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
  //const token = req.cookies.token;
  const token = req.cookies.token || req.headers['authorization']; //De esta manera tomo el token que viene en una cookie de la aplicación web o el token que viene en el heders de la aplición movil.
  console.log("Token recibido:", token); // Log para verificar el token
  
  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);
    req.user = decoded;
    console.log("Valor de req.user en authenticateToken: ", req.user);
    next();
  } catch (err) {
    /* res.status(400).json({ message: "Invalid token" }); */
    // Manejo específico del error de token expirado
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token expired. Please log in again." 
      });
    }
    // Manejo de cualquier otro error
    res.status(400).json({ 
      message: "Invalid token" 
    });
  }
};

export default authenticateToken;

