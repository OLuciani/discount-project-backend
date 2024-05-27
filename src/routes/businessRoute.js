import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import businessController from "../controllers/businessController.js";  //Hay que poner si o si .js

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de multer para el manejo de imágenes
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, "/../../public/img"));
    },
    filename: (req, file, callback) => {
        callback(null, "file-" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });


router.post("/business_create", upload.single("imageURL"), businessController.business_create);
router.get("/business_list", businessController.business_list);
router.get("/business_detail/:_id", businessController.business_detail);

export default router;