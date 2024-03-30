import express from "express";
const router = express.Router();

import businessController from "../controllers/businessController.js";  //Hay que poner si o si .js

router.get("/business_list", businessController.business_list);
router.get("/business_detail/:_id", businessController.business_detail);

export default router;