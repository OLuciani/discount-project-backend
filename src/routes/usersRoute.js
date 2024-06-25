//Este router funciona perfecto hasta cambiando las dos contrseñas nuevas en firebase y mongo db
/* import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import validationsLogin from "../middlewares/validationsLogin.js";
import authenticateToken from "../middlewares/authenticateToken.js";


import usersController from "../controllers/usersController.js";

  //const authenticateToken = (req, res, next) => {
  //const authHeader = req.headers.authorization;
  //const token = authHeader && authHeader.split(' ')[1];
  //console.log("Token recibido:", token);

  //if (!token) {
    //return res.status(401).json({ message: 'Token no proporcionado' });
 // }

  //try {
    //const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("Token decodificado:", decoded);
    //req.user = decoded;
    //next();
 //} catch (error) {
   // console.error("Error al verificar el token:", error);
    //return res.status(403).json({ message: 'Token no válido' });
  //}
//}; 

router.get("/users_list", usersController.users_list);
router.post("/user_register", usersController.user_register);
router.patch("/user_update/:_id", usersController.user_update);
router.post("/login", validationsLogin, usersController.login);
router.get("/checkEmail/:email", usersController.checkEmail);
router.patch('/resetPassword', authenticateToken, usersController.resetPassword);
router.post("/sendResetFirebaseEmail", usersController.sendResetFirebaseEmail);//Ruta para enviar el mail con el token de firebase al usuario.

export default router;  */




import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import validationsLogin from "../middlewares/validationsLogin.js";
import authenticateToken from "../middlewares/authenticateToken.js";


import usersController from "../controllers/usersController.js";

  //const authenticateToken = (req, res, next) => {
  //const authHeader = req.headers.authorization;
  //const token = authHeader && authHeader.split(' ')[1];
  //console.log("Token recibido:", token);

  //if (!token) {
    //return res.status(401).json({ message: 'Token no proporcionado' });
 // }

  //try {
    //const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("Token decodificado:", decoded);
    //req.user = decoded;
    //next();
 //} catch (error) {
   // console.error("Error al verificar el token:", error);
    //return res.status(403).json({ message: 'Token no válido' });
  //}
//}; 

router.post("/user_register", usersController.user_register);
router.get("/user_detail/:_id", authenticateToken, usersController.user_detail);
router.get("/users_list", usersController.users_list);
//router.patch("/user_update/:_id", usersController.user_update);
router.patch("/businessId_and_businessType_update/:_id", usersController.businessId_and_businessType_update);
router.patch("/user_update/:_id", authenticateToken, usersController.user_update);
router.post("/login", validationsLogin, usersController.login);
router.get("/checkEmail/:email", usersController.checkEmail);
router.patch('/resetPassword', authenticateToken, usersController.resetPassword);
//router.post("/sendResetFirebaseEmail", usersController.sendResetFirebaseEmail);//Ruta para enviar el mail con el token de firebase al usuario.

export default router;

