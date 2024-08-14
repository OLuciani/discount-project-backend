import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";


import checAccountController from "../controllers/checkAccountController.js";  

const router = express.Router();

const roleAdminWeb = process.env.ROLE_ADMINWEB;


router.get("/checkMyAccountPermissions", authenticateToken, authorizeRole([roleAdminWeb]), checAccountController.checkMyAccountPermissions);


export default router;