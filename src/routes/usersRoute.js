import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import validationsLogin from "../middlewares/validationsLogin.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import authenticateResetToken from "../middlewares/authenticateResetToken.js";
import authenticateConfirmEmailToken from "../middlewares/authenticateConfirmEmailToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import authenticateCreateBusinessEmployee from "../middlewares/authenticateCreateBusinessEmployee.js";
import authenticateCreateBusinessManager from "../middlewares/authenticateCreateBusinessManager.js";

import usersController from "../controllers/usersController.js";

/* const roleAppAdmin = process.env.ROLE_APP_ADMIN;
console.log("Valor de roleAppAdmin: ", roleAppAdmin);
const roleUser = process.env.ROLE_USER;
console.log("Valor de roleUser: ", roleUser);
const roleAdminWeb = process.env.ROLE_ADMINWEB;
console.log("Valor de roleAdminWeb: ", roleAdminWeb); */
const roleBusinessDirector = process.env.ROLE_BUSINESS_DIRECTOR;
console.log("Valor de roleBusinessDirector: ", roleBusinessDirector);
const roleAppAdmin = process.env.ROLE_APP_ADMIN;
console.log("Valor de roleAppAdmin: ", roleAppAdmin);



router.post("/confirm_email", usersController.confirm_email);
router.post("/user_register", authenticateConfirmEmailToken, usersController.user_register); //Ruta para registrar a un usuario administrador de la cuenta de un negocio que publica en la app.

router.post("/user_register_mobile", usersController.user_register_mobile); // Ruta para registrar a un usuario de la aplicación móvil.

router.post("/invitation_business_employee_user", authenticateToken, authorizeRole([roleBusinessDirector]), usersController.invitation_business_employee_user); // Ruta p/invitar a un usuario con rol de empleado en la cuenta de un determinado negocio.

router.post("/create_business_employee_user", authenticateCreateBusinessEmployee, usersController.create_business_employee_user);

router.post("/invitation_extra_business_admin_user", authenticateToken, authorizeRole([roleBusinessDirector]), usersController.invitation_extra_business_admin_user); // Ruta p/invitar a un usuario con rol de administrador de un negocio en particular.

router.post("/create_extra_business_admin_user", authenticateCreateBusinessManager,usersController.create_extra_business_admin_user);

router.get("/user_detail", authenticateToken, usersController.user_detail);
router.get("/users_list", usersController.users_list);
router.get("/all_users_list", authenticateToken, authorizeRole([roleAppAdmin]), usersController.all_users_list);
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

router.get("/pending_users", authenticateToken, authorizeRole([roleAppAdmin]), usersController.pending_users);

router.patch("/approve_user/:_id", authenticateToken, authorizeRole([roleAppAdmin]), usersController.approve_user);

//router.post("/send_notification_pending_user", authenticateToken, authorizeRole([roleAdminApp]), usersController.send_notification_pending_user);
router.post("/send_user_notification", authenticateToken, authorizeRole([roleAppAdmin]), usersController.send_user_notification);

router.get("/user_pending_notifications", authenticateToken, /* authorizeRole([roleUser]), */ usersController.user_pending_notifications);

router.post("/mark_user_notification_as_read", authenticateToken, usersController.mark_user_notification_as_read);

router.get("/all_business_admin_users", authenticateToken, usersController.all_business_admin_users);

router.get("/asociated_business_users", authenticateToken, usersController.asociated_business_users);

router.patch("/desactivate_user/:_id", authenticateToken, authorizeRole([roleAppAdmin, roleBusinessDirector]), usersController.desactivate_user);

router.patch("/activate_user/:_id", authenticateToken, authorizeRole([roleAppAdmin, roleBusinessDirector]), usersController.activate_user);

router.delete("/delete_user/:_id", authenticateToken, authorizeRole([roleAppAdmin, roleBusinessDirector]),usersController.delete_user);

export default router;

