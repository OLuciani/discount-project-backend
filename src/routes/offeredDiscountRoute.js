import express from "express";
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

export default router;