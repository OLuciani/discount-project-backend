/* import multer from 'multer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import uploadFileToFirebase from '../../config/imageUpload.js'; 

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Prueba para asegurarnos de que multer se está importando correctamente
const multerInstance = multer.default || multer;

// Configuración de multer para almacenar archivos en memoria
const storage = multer.memoryStorage(); // Usa `multer.memoryStorage()` directamente

// Asegurémonos de que esto está funcionando correctamente
const upload = multer({ storage }).fields([ // Usar multer directamente con configuración
  { name: 'imageURL', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'pdfBusinessRegistration', maxCount: 1 }
]);

// Middleware para procesar imágenes con Sharp y manejar PDFs
const processFiles = async (req, res, next) => {
  const files = req.files;

  console.log("Archivos recibidos:", files); // Verifica los archivos recibidos

  if (!files) {
    console.log("No se subieron archivos, continuando sin procesar.");
    return next(); // Continuar si no se suben archivos
  }

  try {
    // Procesar imagen del negocio
    if (files.imageURL) {
      const imageFile = files.imageURL[0];
      console.log("Procesando imagen del negocio:", imageFile.originalname); // Verifica el nombre del archivo

      const processedImage = await sharp(imageFile.buffer)
        .resize({ width: 800 }) // Redimensionar la imagen a un ancho máximo de 800px
        .webp({ quality: 80 }) // Convertir a formato WebP
        .toBuffer();

      const imageUrl = await uploadFileToFirebase(new File([processedImage], `image-${Date.now()}.webp`, { type: 'image/webp' }), 'images');
      req.files.imageURL[0].firebaseUrl = imageUrl;
      console.log("URL de la imagen del negocio:", imageUrl); // Verifica la URL obtenida
    }

    // Procesar logo del negocio
    if (files.logo) {
      const logoFile = files.logo[0];
      console.log("Procesando logo del negocio:", logoFile.originalname); // Verifica el nombre del archivo

      const processedLogo = await sharp(logoFile.buffer)
        .resize({ width: 800 }) // Redimensionar la imagen a un ancho máximo de 800px
        .webp({ quality: 80 }) // Convertir a formato WebP
        .toBuffer();

      const logoUrl = await uploadFileToFirebase(new File([processedLogo], `logo-${Date.now()}.webp`, { type: 'image/webp' }), 'logos');
      req.files.logo[0].firebaseUrl = logoUrl;
      console.log("URL del logo del negocio:", logoUrl); // Verifica la URL obtenida
    }

    // Procesar PDF de inscripción
    if (files.pdfBusinessRegistration) {
      const pdfFile = files.pdfBusinessRegistration[0];
      console.log("Procesando PDF de inscripción:", pdfFile.originalname); // Verifica el nombre del archivo

      const pdfUrl = await uploadFileToFirebase(new File([pdfFile.buffer], pdfFile.originalname, { type: 'application/pdf' }), 'pdfs');
      req.files.pdfBusinessRegistration[0].firebaseUrl = pdfUrl;
      console.log("URL del PDF de inscripción:", pdfUrl); // Verifica la URL obtenida
    }

    next();
  } catch (error) {
    console.error("Error al procesar los archivos:", error);
    return res.status(500).json({ error: "Error al procesar los archivos" });
  }
};

export { upload, processFiles }; */


import multer from "multer";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname } from "path";
import uploadDocumentToFirebase from "../../config/uploadDocumentToFirebase.js";

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de multer para almacenar archivos en memoria
const storage = multer.memoryStorage(); // Almacena los archivos en memoria
const upload = multer({ storage }).fields([
  { name: "imageURL", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "pdfBusinessRegistration", maxCount: 1 },
]);

// Middleware para procesar archivos
const processFiles = async (req, res, next) => {
  const files = req.files;

  if (!files) {
    console.log("No se subieron archivos.");
    return next(); // Si no hay archivos, pasa al siguiente middleware
  }

  try {
    // Procesar imagen del negocio
    if (files.imageURL) {
      const imageFile = files.imageURL[0];

      const processedImage = await sharp(imageFile.buffer)
        .resize({ width: 800 }) // Redimensiona a un ancho de 800px
        .webp({ quality: 80 }) // Convierte a formato WebP
        .toBuffer();

      const imageUrl = await uploadDocumentToFirebase({
        buffer: processedImage,
        originalname: `image-${Date.now()}.webp`,
        mimetype: "image/webp",
      });

      req.files.imageURL[0].firebaseUrl = imageUrl;
    }

    // Procesar logo del negocio
    if (files.logo) {
      const logoFile = files.logo[0];

      const processedLogo = await sharp(logoFile.buffer)
        .resize({ width: 800 }) // Redimensiona a un ancho de 800px
        .webp({ quality: 80 }) // Convierte a formato WebP
        .toBuffer();

      const logoUrl = await uploadDocumentToFirebase({
        buffer: processedLogo,
        originalname: `logo-${Date.now()}.webp`,
        mimetype: "image/webp",
      });

      req.files.logo[0].firebaseUrl = logoUrl;
    }

    // Procesar PDF de inscripción
    if (files.pdfBusinessRegistration) {
      const pdfFile = files.pdfBusinessRegistration[0];

      const pdfUrl = await uploadDocumentToFirebase({
        buffer: pdfFile.buffer,
        originalname: pdfFile.originalname,
        mimetype: "application/pdf",
      });

      req.files.pdfBusinessRegistration[0].firebaseUrl = pdfUrl;
    }

    next();
  } catch (error) {
    console.error("Error al procesar los archivos:", error);
    res.status(500).json({ error: "Error al procesar los archivos" });
  }
};

export { upload, processFiles };


