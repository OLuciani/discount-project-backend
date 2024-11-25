/* import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase.js"; // Asegúrate de importar `storage`
import { v4 as uuidv4 } from "uuid"; // Para generar nombres únicos

// Función para subir documentos o PDFs a Firebase Storage
const uploadDocumentToFirebase = async (file) => {
  try {
    console.log("Subiendo documento a Firebase Storage...");

    // Define la referencia de almacenamiento en la carpeta `documents/`
    const fileName = `${uuidv4()}-${file.name || file.originalname}`;
    const storageRef = ref(storage, `documents/${fileName}`);

    // Sube el archivo con el tipo MIME adecuado
    await uploadBytes(storageRef, file, {
      contentType: file.mimetype || 'application/pdf' // Establecer tipo MIME (por defecto 'application/pdf')
    });

    // Obtiene la URL de descarga
    const url = await getDownloadURL(storageRef);
    console.log("Documento subido, URL obtenida:", url);
    return url;
  } catch (error) {
    console.error("Error subiendo el documento:", error);
    throw error;
  }
};

export default uploadDocumentToFirebase; */


import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase.js"; // Asegúrate de importar `storage`
import { v4 as uuidv4 } from "uuid"; // Para generar nombres únicos

// Función para subir documentos o PDFs a Firebase Storage
const uploadDocumentToFirebase = async (file) => {
  try {
    console.log("Subiendo documento a Firebase Storage...");

    // Genera un nombre único para el archivo
    const fileName = `${uuidv4()}-${file.name || file.originalname}`;
    const storageRef = ref(storage, `documents/${fileName}`);

    // Sube el archivo a Firebase Storage
    await uploadBytes(storageRef, file.buffer || file, {
      contentType: file.mimetype || "application/pdf", // Establece el tipo MIME
    });

    // Obtiene la URL de descarga
    const url = await getDownloadURL(storageRef);
    console.log("Documento subido, URL obtenida:", url);
    return url;
  } catch (error) {
    console.error("Error subiendo el documento:", error);
    throw error;
  }
};

export default uploadDocumentToFirebase;

