import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import offeredDiscountsController from "../controllers/offeredDiscountsController.js";
import { upload, processFiles } from "../middlewares/multerSharpMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();

//const roleAdminWeb = process.env.ROLE_ADMINWEB;
const roleBusinessDirector = process.env.ROLE_BUSINESS_DIRECTOR;
const roleBusinessManager = process.env.ROLE_BUSINESS_MANAGER;
const roleBusinessEmployee = process.env.ROLE_BUSINESS_EMPLOYEE;


router.post("/discount_create", authenticateToken, upload, processFiles, offeredDiscountsController.discount_create);

router.get("/discounts_list", offeredDiscountsController.discounts_list);

router.get("/discounts_list_one_business", authenticateToken, authorizeRole([roleBusinessDirector, roleBusinessManager, roleBusinessEmployee]), offeredDiscountsController.discounts_list_one_business);

router.get("/discount_detail/:_id", authenticateToken, offeredDiscountsController.discount_detail);

router.patch("/discount_update/:_id", authenticateToken, authorizeRole([roleBusinessDirector, roleBusinessManager, roleBusinessEmployee]), upload, processFiles, offeredDiscountsController.discount_update);

router.patch("/discount_update_generateDiscounts/:_id", authenticateToken, offeredDiscountsController.discount_update_generatedDiscounts);

router.patch("/discount_update_usedDiscounts/:_id", authenticateToken,
offeredDiscountsController.discount_update_usedDiscounts);

router.patch("/discount_update_viewsDiscounts/:_id", offeredDiscountsController.discount_update_viewsDiscounts);

router.delete("/discount_delete/:_id", authenticateToken, offeredDiscountsController.discount_delete);

export default router;
