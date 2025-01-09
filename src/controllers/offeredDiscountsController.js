//import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises"; // Importar fs para operaciones de sistema de archivos
import { Decimal } from "decimal.js";
import { admin } from "../../config/firebase.js";

const bucket = admin.storage().bucket(); // Aquí puedes acceder al bucket de firebase

/* // Establezco la conexión a la base de datos con la URL almacenada en una variable de entorno
mongoose
  .connect(
    "mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project"
  )
  .then(() => console.log("Conectado a Base de Datos"));
// Establezco una opción adicional para consultas estrictas
mongoose.set("strictQuery", true); */

import OfferedDiscount from "../models/OfferedDiscount.model.js";

console.log(OfferedDiscount);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para desactivar los descuentos expirados
export const deactivateExpiredDiscounts = async () => {
  try {
    const now = new Date();
    const expiredDiscounts = await OfferedDiscount.find({
      expirationDate: { $lt: now },
      isActive: true, // Solo descuentos activos
    });

    for (const discount of expiredDiscounts) {
      discount.isActive = false;
      discount.isDeleted = true;
      await discount.save();
    }

    console.log(`Se desactivaron ${expiredDiscounts.length} descuentos expirados.`);
  } catch (error) {
    console.error("Error al desactivar descuentos expirados:", error);
  }
};

// Llamo a la función cada hora para desactivar los descuentos expirados.
setInterval(deactivateExpiredDiscounts, 60 * 60 * 1000); // Se ejecuta cada 1 hora

const controller = {
  /* discount_create: async (req, res) => {
    try {
      const {
        businessName,
        //businessId,
        businessType,
        title,
        description,
        normalPrice,
        discountAmount,
        validityPeriod,
        isActive,
        businessLocationLatitude,
        businessLocationLongitude
      } = req.body;

      console.log('Datos recibidos en discount_create:', req.body);

      // Convertir las coordenadas a números
      const numberBusinessLocationLatitude = parseFloat(businessLocationLatitude);
      const numberBusinessLocationLongitude = parseFloat(businessLocationLongitude);

      // Verificar si las coordenadas son válidas
      if (isNaN(numberBusinessLocationLatitude) || isNaN(numberBusinessLocationLongitude)) {
        return res.status(400).json({ message: 'businessLocationLatitude y businessLocationLongitude deben ser números válidos' });
      }
  
      let imageURL = "";
  
      if (req.file && req.file.imageUrl) {
        imageURL = req.file.imageUrl;
      }

      // Obtener y registrar dimensiones y peso del archivo (de la imágen)
      const { width, height } = req.file.metadata;
      const fileSize = req.file.size; // Peso del archivo en bytes

      console.log('Dimensiones de la imagen:');
      console.log('Anchura:', width);
      console.log('Altura:', height);
      console.log('Peso del archivo:', fileSize, 'bytes');
  
      console.log("Valor de normalPrice: ", normalPrice);
      console.log("Valor de discountAmount: ", discountAmount);
  
      const normalPriceNumber = new Decimal(normalPrice);
      const discountAmountNumber = new Decimal(discountAmount);
  
      if (!normalPriceNumber.isFinite() || !discountAmountNumber.isFinite()) {
        return res.status(400).json({ error: "Valores de precio o descuento no válidos" });
      }
  
      const isActiveBoolean = isActive === "true";
  
      const newPrice = normalPriceNumber
        .times(1 - discountAmountNumber.div(100))
        .toDecimalPlaces(2)
        .toNumber();
  
      const now = new Date();
      const startDateTime = now;
      const durationDays = validityPeriod ? Number(validityPeriod) : null;
      const expirationDate = durationDays
      ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
      : null;

      const { businessId } = req.user; // Extrae el userId del objeto req.user
  
      const newOfferedDiscount = new OfferedDiscount({
        businessName,
        businessId: businessId,
        businessType,
        title,
        description,
        normalPrice: normalPriceNumber.toNumber(),
        priceWithDiscount: newPrice,
        discountAmount: discountAmountNumber.toNumber(),
        imageURL,
        validityPeriod: durationDays,
        isActive: isActiveBoolean,
        startDateTime,
        durationDays,
        expirationDate,
        businessLocationLatitude: numberBusinessLocationLatitude,
        businessLocationLongitude: numberBusinessLocationLongitude
      });
  
      const savedDiscount = await newOfferedDiscount.save();
  
      if (!savedDiscount) {
        throw new Error("Error en el registro del descuento.");
      }
  
      res.status(200).json({ message: "El descuento se guardó exitosamente." });
    } catch (error) {
      console.error("Error en el registro del descuento:", error.message);
      res.status(500).json({ error: "Error en el registro del descuento." });
    }
  }, */
  //Este funciona bien en localhost. 24 noviembre 2024
  /* discount_create: async (req, res) => {
    try {
      const {
        businessName,
        businessType,
        title,
        description,
        normalPrice,
        discountAmount,
        validityPeriod,
        isActive,
        businessLocationLatitude,
        businessLocationLongitude,
      } = req.body;

      console.log("Datos recibidos en discount_create:", req.body);

      // Convertir las coordenadas a números
      const numberBusinessLocationLatitude = parseFloat(
        businessLocationLatitude
      );
      const numberBusinessLocationLongitude = parseFloat(
        businessLocationLongitude
      );

      // Verificar si las coordenadas son válidas
      if (
        isNaN(numberBusinessLocationLatitude) ||
        isNaN(numberBusinessLocationLongitude)
      ) {
        return res
          .status(400)
          .json({
            message:
              "businessLocationLatitude y businessLocationLongitude deben ser números válidos",
          });
      }

       let imageURL = "";
      

      const imageUrl = req.files.imageURL ? req.files.imageURL[0].firebaseUrl : null;

      // Aquí puedes eliminar la obtención de metadatos de la imagen,
      // ya que no están disponibles en req.file si usas memoryStorage
      console.log("URL de la imagen:", imageURL);

      console.log("Valor de normalPrice: ", normalPrice);
      console.log("Valor de discountAmount: ", discountAmount);

      const normalPriceNumber = new Decimal(normalPrice);
      const discountAmountNumber = new Decimal(discountAmount);

      if (!normalPriceNumber.isFinite() || !discountAmountNumber.isFinite()) {
        return res
          .status(400)
          .json({ error: "Valores de precio o descuento no válidos" });
      }

      const isActiveBoolean = isActive === "true";

      const newPrice = normalPriceNumber
        .times(1 - discountAmountNumber.div(100))
        .toDecimalPlaces(2)
        .toNumber();

      const now = new Date();
      const startDateTime = now;
      const durationDays = validityPeriod ? Number(validityPeriod) : null;
      const expirationDate = durationDays
        ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
        : null;

      const { businessId } = req.user; // Extrae el businessId del objeto req.user

      const newOfferedDiscount = new OfferedDiscount({
        businessName,
        businessId,
        businessType,
        title,
        description,
        normalPrice: normalPriceNumber.toNumber(),
        priceWithDiscount: newPrice,
        discountAmount: discountAmountNumber.toNumber(),
        imageURL: imageUrl,
        validityPeriod: durationDays,
        isActive: isActiveBoolean,
        startDateTime,
        durationDays,
        expirationDate,
        businessLocationLatitude: numberBusinessLocationLatitude,
        businessLocationLongitude: numberBusinessLocationLongitude,
      });

      const savedDiscount = await newOfferedDiscount.save();

      if (!savedDiscount) {
        throw new Error("Error en el registro del descuento.");
      }

      res.status(200).json({ message: "El descuento se guardó exitosamente." });
    } catch (error) {
      console.error("Error en el registro del descuento:", error.message);
      res.status(500).json({ error: "Error en el registro del descuento." });
    }
  }, */
  /* discount_create: async (req, res) => {
    try {
      const {
        businessName,
        businessType,
        title,
        description,
        normalPrice,
        discountAmount,
        validityPeriod,
        isActive,
        businessLocationLatitude,
        businessLocationLongitude,
      } = req.body;
  
      console.log("Datos recibidos en discount_create:", req.body);
  
      // Validar campos requeridos
      const requiredFields = [
        "businessName",
        "businessType",
        "title",
        "description",
        "normalPrice",
        "discountAmount",
        "validityPeriod",
        "isActive",
        "businessLocationLatitude",
        "businessLocationLongitude",
      ];
      requiredFields.forEach((field) => {
        if (!req.body[field]) {
          console.error(`Falta el campo ${field} en req.body`);
        }
      });
  
      console.log("Contenido de req.files:", req.files);
      if (!req.files || !req.files.imageURL) {
        console.error("No se encontró imageURL en req.files");
      }
  
      const imageUrl = req.files.imageURL ? req.files.imageURL[0].firebaseUrl : null;
  
      console.log("Contenido de req.user:", req.user);
      if (!req.user || !req.user.businessId) {
        console.error("Falta el campo businessId en req.user");
        return res.status(400).json({ error: "Falta el campo businessId." });
      }
  
      const normalPriceNumber = new Decimal(normalPrice);
      const discountAmountNumber = new Decimal(discountAmount);
  
      console.log("Cálculo del precio con descuento:", {
        normalPrice: normalPriceNumber.toNumber(),
        discountAmount: discountAmountNumber.toNumber(),
      });
  
      const newPrice = normalPriceNumber
        .times(1 - discountAmountNumber.div(100))
        .toDecimalPlaces(2)
        .toNumber();
  
      console.log("Precio con descuento calculado:", newPrice);
  
      const now = new Date();
      const startDateTime = now;
      const durationDays = validityPeriod ? Number(validityPeriod) : null;
      const expirationDate = durationDays
        ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
        : null;
  
      const newOfferedDiscount = new OfferedDiscount({
        businessName,
        businessId: req.user.businessId,
        businessType,
        title,
        description,
        normalPrice: normalPriceNumber.toNumber(),
        priceWithDiscount: newPrice,
        discountAmount: discountAmountNumber.toNumber(),
        imageURL: imageUrl,
        validityPeriod: durationDays,
        isActive: isActive === "true",
        startDateTime,
        durationDays,
        expirationDate,
        businessLocationLatitude: parseFloat(businessLocationLatitude),
        businessLocationLongitude: parseFloat(businessLocationLongitude),
      });
  
      try {
        const savedDiscount = await newOfferedDiscount.save();
        console.log("Descuento guardado exitosamente:", savedDiscount);
        res.status(200).json({ message: "El descuento se guardó exitosamente." });
      } catch (dbError) {
        console.error("Error al guardar el descuento en la base de datos:", dbError);
        res
          .status(500)
          .json({ error: "Error al guardar el descuento en la base de datos." });
      }
    } catch (error) {
      console.error("Error en el registro del descuento:", error.message);
      res.status(500).json({ error: "Error en el registro del descuento." });
    }
  }, */
  //Con subrole visit_user
  discount_create: async (req, res) => {
    try {
      const {
        businessName,
        businessType,
        title,
        description,
        normalPrice,
        discountAmount,
        validityPeriod,
        isActive,
        businessLocationLatitude,
        businessLocationLongitude,
      } = req.body;
  
      console.log("Datos recibidos en discount_create:", req.body);
  
      // Validar campos requeridos
      const requiredFields = [
        "businessName",
        "businessType",
        "title",
        "description",
        "normalPrice",
        "discountAmount",
        "validityPeriod",
        "isActive",
        "businessLocationLatitude",
        "businessLocationLongitude",
      ];
      requiredFields.forEach((field) => {
        if (!req.body[field]) {
          console.error(`Falta el campo ${field} en req.body`);
        }
      });
  
      console.log("Contenido de req.files:", req.files);
      if (!req.files || !req.files.imageURL) {
        console.error("No se encontró imageURL en req.files");
      }
  
      const imageUrl = req.files.imageURL ? req.files.imageURL[0].firebaseUrl : null;
  
      console.log("Contenido de req.user:", req.user);
      if (!req.user || !req.user.businessId) {
        console.error("Falta el campo businessId en req.user");
        return res.status(400).json({ error: "Falta el campo businessId." });
      }
  
      const normalPriceNumber = new Decimal(normalPrice);
      const discountAmountNumber = new Decimal(discountAmount);
  
      console.log("Cálculo del precio con descuento:", {
        normalPrice: normalPriceNumber.toNumber(),
        discountAmount: discountAmountNumber.toNumber(),
      });
  
      const newPrice = normalPriceNumber
        .times(1 - discountAmountNumber.div(100))
        .toDecimalPlaces(2)
        .toNumber();
  
      console.log("Precio con descuento calculado:", newPrice);
  
      const now = new Date();
      const startDateTime = now;
      const durationDays = validityPeriod ? Number(validityPeriod) : null;
      let expirationDate = durationDays
        ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
        : null;

      // Si el subRole del usuario es "visit_user", establecer un tiempo de expiración de 30 minutos
      const { subRole } = req.user;
      const subRole_user = process.env.SUBROLE_VISIT_USER;

      if (subRole === subRole_user) {
        expirationDate = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutos
      }
  
      const newOfferedDiscount = new OfferedDiscount({
        businessName,
        businessId: req.user.businessId,
        businessType,
        title,
        description,
        normalPrice: normalPriceNumber.toNumber(),
        priceWithDiscount: newPrice,
        discountAmount: discountAmountNumber.toNumber(),
        imageURL: imageUrl,
        validityPeriod: durationDays,
        isActive: isActive === "true",
        startDateTime,
        durationDays,
        expirationDate,
        businessLocationLatitude: parseFloat(businessLocationLatitude),
        businessLocationLongitude: parseFloat(businessLocationLongitude),
      });
  
      //Guardar el descuento en la base de datos
      try {
        const savedDiscount = await newOfferedDiscount.save();
        console.log("Descuento guardado exitosamente:", savedDiscount);

        // Si el descuento es creado por un usuario con subRole "visit_user", programar su eliminación después de 30 minutos
        if (subRole === subRole_user) {
          setTimeout(async () => {
            try {
              // Eliminar descuento de la base de datos
              await OfferedDiscount.findByIdAndDelete(savedDiscount._id);
              console.log(`Descuento con ID ${savedDiscount._id} eliminado automáticamente después de 30 minutos.`);

              // Eliminar la imagen de Firebase (si existe)
              if (savedDiscount.imageURL) {
                await deleteImageFromFirebase(savedDiscount.imageURL); // Eliminar la imagen
                console.log(`Imagen eliminada con éxito: ${savedDiscount.imageURL}`);
              }

            } catch (error) {
              console.error(`Error al eliminar el descuento o la imagen para el descuento con ID ${savedDiscount._id}`, error);
            }
          }, 30 * 60 * 1000); // 30 minutos en milisegundos
        }

        res.status(200).json({ message: "El descuento se guardó exitosamente." });
      } catch (dbError) {
        console.error("Error al guardar el descuento en la base de datos:", dbError);
        res
          .status(500)
          .json({ error: "Error al guardar el descuento en la base de datos." });
      }
    } catch (error) {
      console.error("Error en el registro del descuento:", error.message);
      res.status(500).json({ error: "Error en el registro del descuento." });
    }
  },
  discounts_list: (req, res) => {
    //OfferedDiscount.find()
    OfferedDiscount.find({ isDeleted: false, isActive: true }) // Filtra descuentos que no están eliminados lógicamente
      .then((allDiscounts) => res.json(allDiscounts))
      .catch((error) => {
        console.error("Error al buscar usuarios: ", error);
        res.status(500).json({ error: "Error al buscar usuarios" });
      });
  },
  discounts_list_one_business: (req, res) => {
    //const businessId = req.params._id; // Obtengo el ID del negocio desde los parámetros de la solicitud
    const { businessId } = req.user; // Extrae el userId del objeto req.user
    OfferedDiscount.find({
      businessId: businessId,
      isActive: true,
      isDeleted: false,
    }) // Busco descuentos por el ID del negocio, que estén activos y no eliminados lógicamente
      .then((allDiscounts) => {
        if (!allDiscounts || allDiscounts.length === 0) {
          // Manejo el caso si no se encuentran descuentos
          return res.status(404).json({ message: "Descuentos no encontrados" });
        }
        res.json(allDiscounts); // Envío los datos de los descuentos del negocio encontrados como respuesta
      })
      .catch((error) => {
        console.error("Error al buscar descuentos del negocio: ", error);
        res
          .status(500)
          .json({ error: "Error al buscar descuentos del negocio" });
      });
  },
  discount_detail: (req, res) => {
    const discountId = req.params._id; // Obtengo el ID del negocio desde los parámetros de la solicitud

    OfferedDiscount.findById(discountId) // Busco el descuento por su ID
      .then((oneDiscount) => {
        if (!oneDiscount) {
          // Manejo el caso si el descuento no se encuentra
          return res.status(404).json({ message: "Descuento no encontrado" });
        }
        if (oneDiscount.isActive === true) {
          res.json(oneDiscount); // Envío los datos del descuento encontrado como respuesta
        } else {
          return res
            .status(404)
            .json({ message: "El descuento no está activo en este momento." });
        }
      })
      .catch((error) => {
        console.error("Error al buscar el descuento: ", error);
        res.status(500).json({ error: "Error al buscar el descuento" });
      });
  },
  //este discount_update funcionaba perfecto antes de gurardar imagenes en firebase
  /* discount_update: async (req, res) => {
    const { businessId } = req.user; // Extrae businessId del objeto req.user (del token de la cookie).
    try {
      const { _id } = req.params;
      const {
        businessName,
        //businessId,
        businessType,
        title,
        description,
        normalPrice,
        discountAmount,
        validityPeriod,
        isActive,
        expirationDate,
      } = req.body;
  
      let imageURL = "";
  
      const existingDiscount = await OfferedDiscount.findById(_id);
      if (existingDiscount) {
        imageURL = existingDiscount.imageURL;
      }
      
  
      if (req.file && req.file.processedFilePath) {
        imageURL = "img/" + req.file.processedFilePath;
  
        if (existingDiscount && imageURL !== existingDiscount.imageURL) {
          const existingImagePath = path.join(
            __dirname,
            "../../public",
            existingDiscount.imageURL
          );
  
          try {
            await fs.unlink(existingImagePath);
            console.log(
              "Imagen anterior eliminada:",
              existingDiscount.imageURL
            );
          } catch (error) {
            console.error("Error al eliminar la imagen anterior:", error);
          }
        }
      }
  
      const normalPriceNumber = new Decimal(normalPrice);
      const discountAmountNumber = new Decimal(discountAmount);
      const isActiveBoolean = isActive === "true";
  
      if (!normalPriceNumber.isFinite() || !discountAmountNumber.isFinite()) {
        return res.status(400).json({ error: "Valores de precio o descuento no válidos" });
      }

      console.log("Valor de normalPrice antes de aplicarle el descuento: ", normalPrice);
  
      const newPrice = normalPriceNumber
        .times(1 - discountAmountNumber.div(100))
        .toDecimalPlaces(2)
        .toNumber();
  
      const updatedDiscount = await OfferedDiscount.findByIdAndUpdate(
        _id,
        {
          businessName,
          businessId: businessId,
          businessType,
          title,
          description,
          normalPrice: normalPriceNumber.toNumber(),
          priceWithDiscount: newPrice,
          discountAmount: discountAmountNumber.toNumber(),
          imageURL,
          validityPeriod,
          isActive: isActiveBoolean,
          expirationDate,
        },
        { new: true }
      );
  
      if (!updatedDiscount) {
        return res.status(404).json({ message: "Descuento no encontrado" });
      }

      console.log("Descuento modificado y guardada la nueva imagen");
  
      res.status(200).json({
        message: "Descuento actualizado correctamente",
        discount: updatedDiscount,
      });
    } catch (error) {
      console.error("Error al actualizar el descuento:", error.message);
      res.status(500).json({ error: "Error al actualizar el descuento" });
    }
  }, */
  discount_update: async (req, res) => {
    const { businessId } = req.user; // Extrae businessId del objeto req.user (del token de la cookie).
    try {
      const { _id } = req.params;
      const {
        businessName,
        //businessId,
        businessType,
        title,
        description,
        normalPrice,
        discountAmount,
        validityPeriod,
        isActive,
        expirationDate,
      } = req.body;

      /* let imageURL = "";
  
      const existingDiscount = await OfferedDiscount.findById(_id);
      if (existingDiscount) {
        imageURL = existingDiscount.imageURL;
      }
      
  
      // Verifica si hay un archivo subido y su URL y en caso de haberlo lo sube al backend y remueve la imagen vieja de Firebase Storage
      if (req.file && req.file.imageUrl) {
        const newImageURL = req.file.imageUrl;
  
        if (existingDiscount && newImageURL !== existingDiscount.imageURL) {
          const oldImageURL = existingDiscount.imageURL;
          const fileName = oldImageURL.split("/").pop();
  
          try {
            await bucket.file(fileName).delete(); // Elimina la imagen antigua de Firebase
            console.log("Imagen anterior eliminada de Firebase:", oldImageURL);
          } catch (error) {
            console.error("Error al eliminar la imagen anterior de Firebase:", error);
          }
        }
  
        imageURL = newImageURL;
      } */

      /* let imageURL = "";

      // Buscar el descuento existente por su ID
      const existingDiscount = await OfferedDiscount.findById(_id);
      if (existingDiscount) {
        imageURL = existingDiscount.imageURL;
      }


      // Verifica si se subió una nueva imagen y si es asi se crea la variable newImageURL
      let newImageURL = req.files.imageURL ? req.files.imageURL[0].firebaseUrl : null;

      // Si ya había una imagen almacenada y es diferente de la nueva
      if (existingDiscount && newImageURL !== existingDiscount.imageURL) {
        const oldImageURL = existingDiscount.imageURL;

        // Extraer el nombre del archivo de la URL correctamente
        const decodedURL = decodeURIComponent(oldImageURL); // Decodifica los caracteres especiales como %2F
        const regex = /\/o\/(.*?)\?/; // Extrae lo que está entre "/o/" y "?"
        const matches = decodedURL.match(regex);

        let fileName = null;
        if (matches && matches[1]) {
          fileName = matches[1]; // El nombre del archivo será algo como "folder/fileName"
        } else {
          console.error(
            "No se pudo extraer el nombre del archivo de la URL:",
            oldImageURL
          );
        }

        if (fileName) {
          try {
            // Elimina la imagen anterior de Firebase Storage
            await bucket.file(fileName).delete();
            console.log(
              "Imagen anterior eliminada de Firebase:",
              oldImageURL
            );
          } catch (error) {
            console.error(
              "Error al eliminar la imagen anterior de Firebase:",
              error
            );
          }
        }
      }

      // Actualiza la URL de la imagen
      imageURL = newImageURL; */

      let imageURL = "";

      // Buscar el descuento existente por su ID
      const existingDiscount = await OfferedDiscount.findById(_id);
      if (existingDiscount) {
        imageURL = existingDiscount.imageURL; // Mantiene la URL de la imagen existente.
      }

      // Verifica si se subió una nueva imagen
      const newImageURL = req.files.imageURL ? req.files.imageURL[0].firebaseUrl : null;

      // Si se subió una nueva imagen, elimina la antigua y actualiza la URL
      if (newImageURL) {
        const oldImageURL = existingDiscount.imageURL;

        // Extrae el nombre del archivo de la URL de Firebase
        const decodedURL = decodeURIComponent(oldImageURL); // Decodifica caracteres especiales.
        const regex = /\/o\/(.*?)\?/; // Expresión regular para extraer el nombre del archivo.
        const matches = decodedURL.match(regex);

        let fileName = null;
        if (matches && matches[1]) {
          fileName = matches[1]; // Nombre del archivo (carpeta/nombreArchivo).
        } else {
          console.error("No se pudo extraer el nombre del archivo de la URL:", oldImageURL);
        }

        if (fileName) {
          try {
            // Elimina la imagen antigua de Firebase Storage
            await bucket.file(fileName).delete();
            console.log("Imagen anterior eliminada de Firebase:", oldImageURL);
          } catch (error) {
            console.error("Error al eliminar la imagen anterior de Firebase:", error);
          }
        }

        // Actualiza la URL de la imagen a la nueva
        imageURL = newImageURL;
      }
      

      const normalPriceNumber = new Decimal(normalPrice);
      const discountAmountNumber = new Decimal(discountAmount);
      const isActiveBoolean = isActive === "true";

      if (!normalPriceNumber.isFinite() || !discountAmountNumber.isFinite()) {
        return res
          .status(400)
          .json({ error: "Valores de precio o descuento no válidos" });
      }

      console.log(
        "Valor de normalPrice antes de aplicarle el descuento: ",
        normalPrice
      );

      const newPrice = normalPriceNumber
        .times(1 - discountAmountNumber.div(100))
        .toDecimalPlaces(2)
        .toNumber();

      const updatedDiscount = await OfferedDiscount.findByIdAndUpdate(
        _id,
        {
          businessName,
          businessId: businessId,
          businessType,
          title,
          description,
          normalPrice: normalPriceNumber.toNumber(),
          priceWithDiscount: newPrice,
          discountAmount: discountAmountNumber.toNumber(),
          imageURL: imageURL,
          validityPeriod,
          isActive: isActiveBoolean,
          expirationDate,
        },
        { new: true }
      );

      if (!updatedDiscount) {
        return res.status(404).json({ message: "Descuento no encontrado" });
      }

      console.log("Descuento modificado y guardada la nueva imagen");

      res.status(200).json({
        message: "Descuento actualizado correctamente",
        discount: updatedDiscount,
      });
    } catch (error) {
      console.error("Error al actualizar el descuento:", error.message);
      res.status(500).json({ error: "Error al actualizar el descuento" });
    }
  },
  discount_update_generatedDiscounts: async (req, res) => {
    try {
      const { _id } = req.params; // Obtener el ID del descuento de los parámetros de la ruta

      // Verificar si el descuento existe
      const existingDiscount = await OfferedDiscount.findById(_id);
      if (!existingDiscount) {
        return res.status(404).json({ message: "Descuento no encontrado" });
      }

      // Incrementar en 1 el valor de generatedDiscounts
      const updatedDiscount = await OfferedDiscount.findByIdAndUpdate(
        _id,
        { $inc: { generatedDiscounts: 1 } }, // Incrementar el campo generatedDiscounts
        { new: true }
      );

      // Enviar respuesta con el descuento actualizado
      res.status(200).json({
        message: "Generated discounts actualizado correctamente",
        discount: updatedDiscount,
      });
    } catch (error) {
      console.error("Error al actualizar generatedDiscounts:", error.message);
      res.status(500).json({ error: "Error al actualizar generatedDiscounts" });
    }
  },
  /* discount_update_usedDiscounts: async (req, res) => {
    try {
      const { _id } = req.params; // Obtener el ID del descuento de los parámetros de la ruta
  
      // Verificar si el descuento existe
      const existingDiscount = await OfferedDiscount.findById(_id);
      if (!existingDiscount) {
        return res.status(404).json({ message: "Descuento no encontrado" });
      }
  
      // Incrementar en 1 el valor de usedDiscounts
      const updatedDiscount = await OfferedDiscount.findByIdAndUpdate(
        _id,
        { $inc: { usedDiscounts: 1 } }, // Incrementar el campo usedDiscounts
        { new: true }
      );
  
      // Enviar respuesta con el descuento actualizado
      res.status(200).json({
        message: "Used discounts actualizado correctamente",
        discount: updatedDiscount,
      });
    } catch (error) {
      console.error("Error al actualizar usedDiscounts:", error.message);
      res.status(500).json({ error: "Error al actualizar usedDiscounts" });
    }
  }, */
  discount_update_usedDiscounts: async (req, res) => {
    try {
      const { _id } = req.params;

      const existingDiscount = await OfferedDiscount.findById(_id);
      if (!existingDiscount) {
        return res.status(404).json({ message: "Descuento no encontrado" });
      }

      const updatedDiscount = await OfferedDiscount.findByIdAndUpdate(
        _id,
        { $inc: { usedDiscounts: 1 } },
        { new: true }
      );

      if (!updatedDiscount) {
        return res
          .status(500)
          .json({ message: "Error al actualizar el descuento" });
      }

      res.status(200).json({
        message: "Used discounts actualizado correctamente",
        discount: updatedDiscount,
      });
    } catch (error) {
      console.error("Error al actualizar usedDiscounts:", error.message);
      res.status(500).json({ error: "Error al actualizar usedDiscounts" });
    }
  },
  discount_update_viewsDiscounts: async (req, res) => {
    try {
      const { _id } = req.params;

      const existingDiscount = await OfferedDiscount.findById(_id);
      if (!existingDiscount) {
        return res.status(404).json({ message: "Descuento no encontrado" });
      }

      const updatedDiscount = await OfferedDiscount.findByIdAndUpdate(
        _id,
        { $inc: { discountViews: 1 } },
        { new: true }
      );

      if (!updatedDiscount) {
        return res
          .status(500)
          .json({ message: "Error al actualizar el descuento" });
      }

      res.status(200).json({
        message: "viewsDiscounts actualizado correctamente",
        discount: updatedDiscount,
      });
    } catch (error) {
      console.error("Error al actualizar viewsDiscounts:", error.message);
      res.status(500).json({ error: "Error al actualizar viewsDiscounts" });
    }
  },
  discount_delete: async (req, res) => {
    try {
      // Obtengo el ID del descuento desde los parámetros de la solicitud
      const discountId = req.params._id;

      // Verifico si el ID del descuento es válido
      if (!discountId) {
        return res
          .status(400)
          .json({ success: false, message: "ID de descuento es requerido" });
      }

      // Busco y actualiza el descuento para marcarlo como eliminado lógicamente
      // También establezco la fecha de eliminación lógica con la fecha actual en el momento que se elimina el descuento.
      const deletedDiscount = await OfferedDiscount.findByIdAndUpdate(
        discountId,
        { isDeleted: true, dateDiscountDeleted: new Date() },
        { new: true }
      );

      // Si no se encuentra el descuento, devuelve un error 404
      if (!deletedDiscount) {
        return res
          .status(404)
          .json({ success: false, message: "Descuento no encontrado" });
      }

      // Si todo va bien, devuelve una respuesta de éxito
      res.status(200).json({
        success: true,
        message: "Descuento eliminado correctamente",
        discount: deletedDiscount, // Devuelve el descuento eliminado lógicamente
      });
    } catch (error) {
      // Captura cualquier error inesperado y devuelve una respuesta de error 500
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar el descuento",
        error: error.message,
      });
    }
  },
};

export default controller;
