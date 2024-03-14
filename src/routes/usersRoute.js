import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";

import usersController from "../controllers/usersController.js";  //Hay que poner si o si .js


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



router.get("/users_list", usersController.users_list);
router.post("/user_register", usersController.user_register);
router.post("/login", usersController.login);


export default router;
