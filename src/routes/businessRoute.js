import express from "express";
import businessController from "../controllers/businessController.js";  //Hay que poner si o si .js
import authenticateToken from "../middlewares/authenticateToken.js";
import { upload, processImage } from "../middlewares/multerSharpMiddleware.js";

const router = express.Router();


router.post("/business_create", upload.single("imageURL"), processImage, businessController.business_create);

//router.get("/business_detail/:_id", authenticateToken, businessController.business_detail);
router.get("/business_detail/:_id?", authenticateToken, businessController.business_detail);

router.get("/light_business_details/:_id", businessController.light_business_details);

router.get("/business_list", businessController.business_list);

router.patch("/update_business", authenticateToken, upload.single("imageURL"), processImage, businessController.update_business);

export default router;