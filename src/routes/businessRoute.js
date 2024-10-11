import express from "express";
import businessController from "../controllers/businessController.js";  //Hay que poner si o si .js
import authenticateToken from "../middlewares/authenticateToken.js";
//import { upload, processImage } from "../middlewares/multerSharpMiddleware.js";
//import { uploadDocument, processDocument } from '../middlewares/uploadDocument.js';
import { upload, processFiles } from "../middlewares/multerSharpMiddleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const router = express.Router();

const roleAdminApp = process.env.ROLE_ADMINAPP;


//router.post("/business_create", upload.single("imageURL"), processImage, uploadDocument.single("pdfBusinessRegistration"), processDocument, businessController.business_create);

router.post("/business_create", upload, processFiles, businessController.business_create);

//router.get("/business_detail/:_id", authenticateToken, businessController.business_detail);
router.get("/business_detail/:_id?", authenticateToken, businessController.business_detail);

router.get("/light_business_details/:_id", businessController.light_business_details);

router.get("/business_list", businessController.business_list);

//router.patch("/update_business", authenticateToken, upload.single("imageURL"), processImage, businessController.update_business);

router.patch("/update_business", authenticateToken, upload, processFiles, businessController.update_business);

router.get("/pending_business/:_id", authenticateToken, authorizeRole([roleAdminApp]), businessController.pending_business);

export default router;