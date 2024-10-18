import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import validationsLogin from "../middlewares/validationsLogin.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import authenticateResetToken from "../middlewares/authenticateResetToken.js";
import authenticateConfirmEmailToken from "../middlewares/authenticateConfirmEmailToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";


import usersController from "../controllers/usersController.js";

const roleAdminApp = process.env.ROLE_ADMINAPP;
const roleUser = process.env.ROLE_USER;



router.post("/confirm_email", usersController.confirm_email);
router.post("/user_register", authenticateConfirmEmailToken, usersController.user_register);
router.post("/user_register_mobile", usersController.user_register_mobile);
router.get("/user_detail", authenticateToken, usersController.user_detail);
router.get("/users_list", usersController.users_list);
router.get("/active_businessesAdmins_usersList", authenticateToken, authorizeRole([roleAdminApp]), usersController.active_businessesAdmins_usersList);
//router.patch("/user_update/:_id", usersController.user_update);
router.patch("/businessId_and_businessType_update/:_id", usersController.businessId_and_businessType_update);
router.patch("/user_update", authenticateToken, usersController.user_update);
router.post("/login", validationsLogin, usersController.login);
router.get("/user_profile", authenticateToken, usersController.user_profile);

//router.get("/protected_route/:_id", authenticateToken, usersController.protected_route);
router.get("/protected_route", authenticateToken, usersController.protected_route);

router.get("/checkEmail/:email", usersController.checkEmail); //No debe llevar authenticateToken
//router.get("/checkEmailFromMobile/:email", usersController.checkEmailFromMobile); //No debe llevar authenticateToken
router.patch('/resetPassword', authenticateResetToken, usersController.resetPassword);
//router.post("/sendResetFirebaseEmail", usersController.sendResetFirebaseEmail);//Ruta para enviar el mail con el token de firebase al usuario.

router.get("/pending_users", authenticateToken, authorizeRole([roleAdminApp]), usersController.pending_users);

router.patch("/approve_user/:_id", authenticateToken, authorizeRole([roleAdminApp]), usersController.approve_user);

//router.post("/send_notification_pending_user", authenticateToken, authorizeRole([roleAdminApp]), usersController.send_notification_pending_user);
router.post("/send_user_notification", authenticateToken, authorizeRole([roleAdminApp]), usersController.send_user_notification);

router.get("/user_pending_notifications", authenticateToken, /* authorizeRole([roleUser]), */ usersController.user_pending_notifications);

router.post("/mark_user_notification_as_read", authenticateToken, usersController.mark_user_notification_as_read);

export default router;

