/* import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configuración de multer para el manejo de imágenes
const storage = multer.diskStorage({
    // Establezco la carpeta de destino donde se guardarán las imágenes.
    destination: (req, file, callback) => {
      callback(null, path.join(__dirname, "/../../public/IMG"));
    },
    filename: (req, file, callback) => {
      // Establezco el nombre del archivo al guardar la imagen.
      // Se concateno "file-" + la marca de tiempo actual para asegurar un nombre único.
      callback(
        null,
        "file-" + Date.now() + path.extname(file.originalname)
      );
    },
  });
  
  // Creo el middleware de multer utilizando la configuración anterior.
  const upload = multer({ storage: storage });


import offeredDiscountsController from "../controllers/offeredDiscountsController.js";  //Hay que poner si o si .js

router.get("/discounts_list", offeredDiscountsController.discounts_list);

router.post("/discount_create", upload.single("imageURL"), offeredDiscountsController.discount_create);

export default router; */


import express from "express";
//import multer from "multer";
//import path from "path";
//import { fileURLToPath } from 'url';
//import { dirname } from 'path';
import authenticateToken from "../middlewares/authenticateToken.js";
import offeredDiscountsController from "../controllers/offeredDiscountsController.js";
import { upload, processImage } from "../middlewares/multerSharpMiddleware.js";


const router = express.Router();

/* const __filename = fileURLToPath(import.meta.url);
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

const upload = multer({ storage: storage }); */


router.post("/discount_create", authenticateToken, upload.single("imageURL"), processImage, offeredDiscountsController.discount_create);

router.get("/discounts_list", offeredDiscountsController.discounts_list);

router.get("/discounts_list_one_business/:_id", authenticateToken, offeredDiscountsController.discounts_list_one_business);

router.get("/discount_detail/:_id", authenticateToken, offeredDiscountsController.discount_detail);

router.patch("/discount_update/:_id", authenticateToken, upload.single("imageURL"), processImage, offeredDiscountsController.discount_update);

router.delete("/discount_delete/:_id", authenticateToken, offeredDiscountsController.discount_delete);


export default router;
