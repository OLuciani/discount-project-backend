import express from "express";
const router = express.Router();

import mainController from "../controllers/mainController.js";  //Hay que poner si o si .js

router.get("/", mainController.index);



export default router;

