import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import validationsLogin from "../middlewares/validationsLogin.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import authenticateResetToken from "../middlewares/authenticateResetToken.js";

import usersController from "../controllers/usersController.js";


router.post("/user_register", usersController.user_register);
router.get("/user_detail", authenticateToken, usersController.user_detail);
router.get("/users_list", usersController.users_list);
//router.patch("/user_update/:_id", usersController.user_update);
router.patch("/businessId_and_businessType_update/:_id", usersController.businessId_and_businessType_update);
router.patch("/user_update", authenticateToken, usersController.user_update);
router.post("/login", validationsLogin, usersController.login);
router.get("/user_profile/:_id", authenticateToken, usersController.user_profile);

//router.get("/protected_route/:_id", authenticateToken, usersController.protected_route);
router.get("/protected_route", authenticateToken, usersController.protected_route);

router.get("/checkEmail/:email", usersController.checkEmail); //No debe llevar authenticateToken
//router.get("/checkEmailFromMobile/:email", usersController.checkEmailFromMobile); //No debe llevar authenticateToken
router.patch('/resetPassword', authenticateResetToken, usersController.resetPassword);
//router.post("/sendResetFirebaseEmail", usersController.sendResetFirebaseEmail);//Ruta para enviar el mail con el token de firebase al usuario.

export default router;

