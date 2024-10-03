
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import uploadDocumentToFirebase from '../../config/uploadDocumentToFirebase.js'; 
// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de multer para almacenar archivos en memoria
const storage = multer.memoryStorage();
const uploadDocument = multer({ storage: storage }); // Cambiar `upload` a `uploadDocument`

// Middleware para procesar archivos PDF y otros documentos
const processDocument = async (req, res, next) => {
  if (!req.file) {
    console.log("No se subió ningún documento.");
    return next(); // Continuar sin procesar si no hay archivo
  }

  console.log("Procesando documento...");

  try {
    // Subir el archivo PDF a Firebase
    const documentUrl = await uploadDocumentToFirebase(req.file);
    
    console.log("Documento subido a Firebase, URL:", documentUrl);
    req.file.documentUrl = documentUrl; // Guardar la URL en la solicitud para usar más adelante

    next();
  } catch (error) {
    console.error("Error al subir el documento a Firebase:", error);
    return res.status(500).json({ error: "Error al subir el documento a Firebase Storage" });
  }
};

// Exportar `uploadDocument` y `processDocument` con los nuevos nombres
export { uploadDocument, processDocument };