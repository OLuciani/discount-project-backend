//Funciona perfecto para una imagen
/* import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase.js"; // Asegúrate de importar `storage`

// Función para subir imágenes
const uploadImageToFirebase = async (file) => {
  try {
    console.log("Subiendo imagen a Firebase Storage...");

    // Define la referencia de almacenamiento
    const storageRef = ref(storage, `images/${file.name}`);

    // Sube el archivo con el tipo MIME adecuado
    await uploadBytes(storageRef, file, {
      contentType: 'image/webp' // Establecer explícitamente el tipo MIME
    });
    
    // Obtiene la URL de descarga
    const url = await getDownloadURL(storageRef);
    console.log("Imagen subida, URL obtenida:", url);
    return url;
  } catch (error) {
    console.error("Error subiendo la imagen:", error);
    throw error;
  }
};

export default uploadImageToFirebase; */




import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase.js"; // Asegúrate de importar `storage`

// Función para subir archivos a Firebase
const uploadFileToFirebase = async (file, folder) => {
  try {
    console.log("Subiendo archivo a Firebase Storage...");
    console.log(`Archivo a subir: ${file.name}, Tipo: ${file.type}, Carpeta: ${folder}`);
    
    // Define la referencia de almacenamiento basada en el tipo de archivo
    const storageRef = ref(storage, `${folder}/${file.name}`);

    // Subir el archivo con el tipo MIME adecuado
    await uploadBytes(storageRef, file, {
      contentType: file.type, // Usa el tipo MIME del archivo (ej. image/webp, application/pdf)
    });

    // Obtiene la URL de descarga
    const url = await getDownloadURL(storageRef);
    console.log("Archivo subido, URL obtenida:", url);
    return url;
  } catch (error) {
    console.error("Error subiendo el archivo:", error);
    throw error;
  }
};

export default uploadFileToFirebase;

