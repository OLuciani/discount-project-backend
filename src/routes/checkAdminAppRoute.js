import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";


import checAccountController from "../controllers/checkAdminAppController.js";  

const router = express.Router();

const roleAdminApp = process.env.ROLE_ADMINAPP;


router.get("/checkAdminAppPermissions", authenticateToken, authorizeRole([roleAdminApp]), checAccountController.checkAdminAppPermissions);


export default router;