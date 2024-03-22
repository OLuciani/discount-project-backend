import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import authenticateToken from "../middlewares/authenticateToken.js";

import userDiscountQrsController from "../controllers/userDiscountQrsController.js"; //Hay que poner si o si .js

router.get("/userDiscountQrs_list", userDiscountQrsController.userDiscountQrs_list);
router.post("/discountQr_create", authenticateToken, userDiscountQrsController.discountQr_create);

export default router;