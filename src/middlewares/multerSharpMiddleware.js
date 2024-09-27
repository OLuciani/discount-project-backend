//Este funciona perfecto sin Firebase Storage
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

export { upload, processImage }; */




/* import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import uploadImageToFirebase from '../../config/imageUpload.js'; // Asegúrate de importar tu función de subida a Firebase

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de multer para almacenar imágenes en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware para procesar imágenes con Sharp
const processImage = async (req, res, next) => {
  if (!req.file) {
    // Si no se sube ninguna imagen, continúa sin procesar la imagen
    return next();
  }

  const filename = "file-" + Date.now() + ".webp";
  const filePath = path.join(__dirname, "../../public/img", filename);

  try {
    // Procesar la imagen con Sharp
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 800 }) // Redimensionar la imagen a un ancho máximo de 800px
      .webp({ quality: 80 }) // Convertir a formato WebP con calidad 80
      .toBuffer();

    // Obtener metadatos de la imagen procesada
    const metadata = await sharp(buffer).metadata();

    // Guardar el archivo procesado localmente (opcional)
    fs.writeFileSync(filePath, buffer);
    req.file.processedFilePath = filename; // Guardar el nombre del archivo procesado en la solicitud

    // Guardar metadatos en la solicitud
    req.file.metadata = metadata;
    req.file.size = buffer.length; // Tamaño del archivo en bytes

    // Subir la imagen procesada a Firebase Storage
    const imageUrl = await uploadImageToFirebase({
      name: filename,
      buffer, // Usar el buffer procesado
    });
    
    req.file.imageUrl = imageUrl; // Guardar la URL en la solicitud

    next();
  } catch (error) {
    console.error("Error al subir la imagen a Firebase:", error);
    // Notificar al frontend si hay un problema al subir la imagen
    return res.status(500).json({ error: "Error al subir la imagen a Firebase Storage" });  }
};

export { upload, processImage }; */



/* import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import uploadImageToFirebase from '../../config/imageUpload.js'; // Asegúrate de importar tu función de subida a Firebase

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de multer para almacenar imágenes en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware para procesar imágenes con Sharp
const processImage = async (req, res, next) => {
  if (!req.file) {
    console.log("No se subió ninguna imagen, continuando sin procesar.");
    return next();
  }

  const filename = "file-" + Date.now() + ".webp";
  const filePath = path.join(__dirname, "../../public/img", filename);
  
  console.log("Procesando imagen...");

  try {
    console.log("Redimensionando la imagen...");
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 800 }) // Redimensionar la imagen a un ancho máximo de 800px
      .webp({ quality: 80 }) // Convertir a formato WebP con calidad 80
      .toBuffer();

    const metadata = await sharp(buffer).metadata();
    fs.writeFileSync(filePath, buffer);
    req.file.processedFilePath = filename; // Guardar el nombre del archivo procesado en la solicitud

    // Guardar metadatos en la solicitud
    req.file.metadata = metadata;
    req.file.size = buffer.length; // Tamaño del archivo en bytes

    console.log("Subiendo imagen a Firebase...");
    const imageUrl = await uploadImageToFirebase({
      name: filename,
      buffer, // Usar el buffer procesado
    });
    
    console.log("Imagen subida a Firebase, URL:", imageUrl);
    req.file.imageUrl = imageUrl; // Guardar la URL en la solicitud

    next();
  } catch (error) {
    console.error("Error al subir la imagen a Firebase:", error);
    // Notificar al frontend si hay un problema al subir la imagen
    return res.status(500).json({ error: "Error al subir la imagen a Firebase Storage" });
  }
};

export { upload, processImage }; */


import multer from 'multer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import uploadImageToFirebase from '../../config/imageUpload.js'; // Asegúrate de importar tu función de subida a Firebase

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de multer para almacenar imágenes en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware para procesar imágenes con Sharp
const processImage = async (req, res, next) => {
  if (!req.file) {
    console.log("No se subió ninguna imagen, continuando sin procesar.");
    return next(); // Continuar sin procesar si no hay archivo
  }

  const filename = "file-" + Date.now() + ".webp";

  console.log("Procesando imagen...");

  try {
    console.log("Redimensionando la imagen...");
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 800 }) // Redimensionar la imagen a un ancho máximo de 800px
      .webp({ quality: 80 }) // Convertir a formato WebP con calidad 80
      .toBuffer();

    console.log("Tamaño del buffer de la imagen procesada:", buffer.length);

    // Subir a Firebase
    const imageUrl = await uploadImageToFirebase(new File([buffer], filename, { type: 'image/webp' }));
    
    console.log("Imagen subida a Firebase, URL:", imageUrl);
    req.file.imageUrl = imageUrl; // Guardar la URL en la solicitud

    next();
  } catch (error) {
    console.error("Error al subir la imagen a Firebase:", error);
    return res.status(500).json({ error: "Error al subir la imagen a Firebase Storage" });
  }
};

export { upload, processImage };


