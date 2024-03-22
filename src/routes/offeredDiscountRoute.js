import express from "express";
const router = express.Router();

import offeredDiscountsController from "../controllers/offeredDiscountsController.js";  //Hay que poner si o si .js

router.get("/discounts_list", offeredDiscountsController.discounts_list);

export default router;