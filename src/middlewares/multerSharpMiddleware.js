//Este funciona perfecto pero no muestra el tamaño del archivo ni las dimensiones de la imagen
/* import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de multer para almacenar imágenes en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware para procesar imágenes con Sharp
const processImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filename = "file-" + Date.now() + ".webp";
  const filePath = path.join(__dirname, "../../public/img", filename);

  // Procesar la imagen con Sharp
  sharp(req.file.buffer)
    .resize({ width: 800 }) // Redimensionar la imagen a un ancho máximo de 800px
    .webp({ quality: 80 }) // Convertir a formato WebP con calidad 80
    .toBuffer()
    .then((buffer) => {
      fs.writeFileSync(filePath, buffer);
      req.file.processedFilePath = filename; // Guardar el nombre del archivo procesado en la solicitud
      next();
    })
    .catch((error) => {
      res.status(500).send('Error al procesar la imagen');
    });
};

export { upload, processImage };
 */




/* import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de multer para almacenar imágenes en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware para procesar imágenes con Sharp
const processImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filename = "file-" + Date.now() + ".webp";
  const filePath = path.join(__dirname, "../../public/img", filename);

  // Procesar la imagen con Sharp
  sharp(req.file.buffer)
    .resize({ width: 800 }) // Redimensionar la imagen a un ancho máximo de 800px
    .webp({ quality: 80 }) // Convertir a formato WebP con calidad 80
    .toBuffer()
    .then(async (buffer) => {
      // Obtener metadatos de la imagen procesada
      const metadata = await sharp(buffer).metadata();

      fs.writeFileSync(filePath, buffer);
      req.file.processedFilePath = filename; // Guardar el nombre del archivo procesado en la solicitud

      // Guardar metadatos en la solicitud
      req.file.metadata = metadata;
      req.file.size = buffer.length; // Tamaño del archivo en bytes

      next();
    })
    .catch((error) => {
      res.status(500).send('Error al procesar la imagen');
    });
};

export { upload, processImage }; */




import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de multer para almacenar imágenes en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware para procesar imágenes con Sharp
const processImage = (req, res, next) => {
  if (!req.file) {
    // Si no se sube ninguna imagen, continúa sin procesar la imagen
    return next();
  }

  const filename = "file-" + Date.now() + ".webp";
  const filePath = path.join(__dirname, "../../public/img", filename);

  // Procesar la imagen con Sharp
  sharp(req.file.buffer)
    .resize({ width: 800 }) // Redimensionar la imagen a un ancho máximo de 800px
    .webp({ quality: 80 }) // Convertir a formato WebP con calidad 80
    .toBuffer()
    .then(async (buffer) => {
      // Obtener metadatos de la imagen procesada
      const metadata = await sharp(buffer).metadata();

      fs.writeFileSync(filePath, buffer);
      req.file.processedFilePath = filename; // Guardar el nombre del archivo procesado en la solicitud

      // Guardar metadatos en la solicitud
      req.file.metadata = metadata;
      req.file.size = buffer.length; // Tamaño del archivo en bytes

      next();
    })
    .catch((error) => {
      res.status(500).send('Error al procesar la imagen');
    });
};

export { upload, processImage };

