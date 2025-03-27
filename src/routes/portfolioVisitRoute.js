import express from "express";
const router = express.Router();

import portfolioVisitController from "../controllers/portfolioVisitController.js";  //Hay que poner si o si .js

router.put("/visitCounter", portfolioVisitController.visitCounter);



export default router;