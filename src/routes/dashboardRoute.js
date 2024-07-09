import express from "express";
const router = express.Router();

import authenticateToken from "../middlewares/authenticateToken.js";

import usersController from "../controllers/usersController.js";


router.get("/dashboard", authenticateToken, dashboardController.dashboard);

export default router;