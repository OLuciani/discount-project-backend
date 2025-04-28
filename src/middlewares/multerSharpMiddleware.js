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
        .rotate() // Corrige la orientación basándose en los metadatos EXIF
        .resize({ width: 800, height: 533 }) // Mantiene la proporción 169:112 del frontend
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
        .rotate() // Corrige la orientación basándose en los metadatos EXIF
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


