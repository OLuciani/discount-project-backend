import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import authenticateToken from "../middlewares/authenticateToken.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

import userDiscountQrsController from "../controllers/userDiscountQrsController.js"; //Hay que poner si o si .js

//const roleAdminWeb = process.env.ROLE_ADMINWEB;
const roleAdminQr = process.env.ROLE_ADMINQR;
const roleBusinessDirector = process.env.ROLE_BUSINESS_DIRECTOR;
const roleBusinessManager = process.env.ROLE_BUSINESS_MANAGER;
const roleBusinessEmployee = process.env.ROLE_BUSINESS_EMPLOYEE;


router.get("/userDiscountQrs_list", userDiscountQrsController.userDiscountQrs_list);
//router.get("/userDiscountQrs_OneUser/:_id", userDiscountQrsController.userDiscountQrs_OneUser);
router.get("/userDiscountQrs_OneUser", authenticateToken, userDiscountQrsController.userDiscountQrs_OneUser);
router.post("/discountQr_create", authenticateToken, userDiscountQrsController.discountQr_create);
router.get("/userDiscountQrs_oneDiscount/:_id", authenticateToken, userDiscountQrsController.userDiscountQrs_oneDiscount);
router.patch("/userDiscountQrs_update/:_id", authenticateToken, authorizeRole([roleBusinessEmployee, roleBusinessManager, roleBusinessDirector]), userDiscountQrsController.userDiscountQrs_update);
router.get("/consumed_discounts", authenticateToken, userDiscountQrsController.consumed_discounts);

export default router;

