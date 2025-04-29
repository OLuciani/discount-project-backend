import dotenv from "dotenv";
import Business from "../models/Business.model.js";
import User from "../models/User.model.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises"; // Importar fs para operaciones de sistema de archivos
import { admin } from "../../config/firebase.js";

const bucket = admin.storage().bucket(); // Aquí 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const controller = {
  business_create: async (req, res) => {
    try {
      const {
        ownerName,
        businessName,
        businessType,
        address,
        addressNumber,
        city,
        country,
        ownerId,
      } = req.body;

      // Validar campos obligatorios
      if (
        !ownerName ||
        !businessName ||
        !businessType ||
        !address ||
        !addressNumber ||
        !city ||
        !country ||
        !ownerId
      ) {
        return res
          .status(400)
          .json({ error: "Todos los campos son obligatorios." });
      }
      
      //Creo las url de los archivos subidos a firebase storage
      const imageUrl = req.files.imageURL ? req.files.imageURL[0].firebaseUrl : null;
      const logoUrl = req.files.logo ? req.files.logo[0].firebaseUrl : null;
      const pdfUrl = req.files.pdfBusinessRegistration ? req.files.pdfBusinessRegistration[0].firebaseUrl : null;

      const apiKey = process.env.HERE_API_KEY;

      // Verificar si la clave API está configurada
      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "API Key para geocodificación no configurada." });
      }

      const fullAddress = `${address} ${addressNumber}, ${city}, ${country}`;

      // Realizo la solicitud a la API de geocodificación
      const response = await fetch(
        `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
          fullAddress
        )}&apiKey=${apiKey}`
      );

      if (!response.ok) {
        return res
          .status(500)
          .json({
            error: "Error al comunicarse con el servicio de geocodificación.",
          });
      }

      const data = await response.json();

      if (data.items.length === 0) {
        return res
          .status(404)
          .json({
            error:
              "No se encontraron coordenadas para la dirección proporcionada.",
          });
      }

      const position = data.items[0].position;
      const businessLatitude = position.lat;
      const businessLongitude = position.lng;

      const newBusiness = new Business({
        ownerName,
        businessName,
        businessType,
        address,
        addressNumber,
        city,
        country,
        latitude: businessLatitude,
        longitude: businessLongitude,
        ownerId,
        imageURL:imageUrl,
        pdfBusinessRegistration:pdfUrl,
        urlLogo:logoUrl,
      });

      const savedBusiness = await newBusiness.save();

      res
        .status(200)
        .json({
          message: "El nuevo negocio se guardó exitosamente.",
          _id: savedBusiness._id,
          businessType: savedBusiness.businessType, pdfBusinessRegistration: savedBusiness.pdfBusinessRegistration
        });
    } catch (error) {
      console.error("Error en el registro del negocio:", error.message);

      if (error.name === "ValidationError") {
        res.status(400).json({ error: "Datos de entrada inválidos." });
      } else {
        res.status(500).json({ error: "Error en el registro del negocio." });
      }
    }
  },
  business_list: (req, res) => {
    Business.find()
      .then((allBusiness) => res.json(allBusiness))
      .catch((error) => {
        console.error("Error al buscar negocios: ", error);
        res.status(500).json({ error: "Error al buscar negocios" });
      });
  },
  business_detail: (req, res) => {
    //const businessId = req.params._id; // Obtengo el ID del negocio desde los parámetros de la solicitud
    const mobileBusinessId = req.params._id;
    console.log("Valor de mobileBusinessId: ", mobileBusinessId);
    const webBusinessId = req.user.businessId; // Extrae businessId del objeto req.user (del token de la cookie).
    console.log("Valor de webBusinessId: ", webBusinessId);
    console.log("Valor de req.user: ", req.user);

    let businessId = "";

    if (mobileBusinessId) {
      businessId = mobileBusinessId;
    } else {
      businessId = webBusinessId;
    }

    console.log("Valor de businessId: ", businessId);
    Business.findById(businessId) // Busco el negocio por su ID
      .then((oneBusiness) => {
        if (!oneBusiness) {
          // Manejo el caso si el negocio no se encuentra
          return res.status(404).json({ message: "Negocio no encontrado" });
        }
        res.json(oneBusiness); // Envío los datos del negocio encontrado como respuesta
      })
      .catch((error) => {
        console.error("Error al buscar el negocio: ", error);
        res.status(500).json({ error: "Error al buscar el negocio" });
      });
  },
  light_business_details: (req, res) => {
    const businessId = req.params._id; // Obtengo el ID del negocio desde los parámetros de la solicitud

    Business.findById(businessId)
      .select("-ownerId -ownerName -_id") // Busco el negocio por su ID y evito mostrar datos sensibles.
      .then((oneBusiness) => {
        if (!oneBusiness) {
          // Manejo el caso si el negocio no se encuentra
          return res.status(404).json({ message: "Negocio no encontrado" });
        }
        res.json(oneBusiness); // Envío los datos del negocio encontrado como respuesta
      })
      .catch((error) => {
        console.error("Error al buscar el negocio: ", error);
        res.status(500).json({ error: "Error al buscar el negocio" });
      });
  },
  //Este update_business anda perfecto 4 de novembre 2024
  update_business: async (req, res) => {
    const { businessId } = req.user; // Extrae businessId del objeto req.user (del token de la cookie).
    
    const { businessName, address, city, country, businessType } = req.body;

    let imageURL = "";

      // Buscar el descuento existente por su ID
      const existingBusiness = await Business.findById(businessId);
      if (existingBusiness) {
        imageURL = existingBusiness.imageURL; // Mantiene la URL de la imagen existente.
      }

      // Verifica si se subió una nueva imagen
      const newImageURL = req.files.imageURL ? req.files.imageURL[0].firebaseUrl : null;

      // Si se subió una nueva imagen, elimina la antigua y actualiza la URL
      if (newImageURL) {
        const oldImageURL = existingBusiness.imageURL;

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

    //console.log("valor de address: ", address);

    // Validar campos obligatorios
    if (req.body.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar." });
    }

    try {
      // Buscar el negocio por su ID y actualizarlo
      const updatedBusiness = await Business.findByIdAndUpdate(
        businessId,
        {
          businessName: businessName,
          address: address,
          city: city,
          country: country,
          businessType: businessType,
          imageURL: imageURL,
        },
        { new: true, runValidators: true }
      );

      if (!updatedBusiness) {
        return res.status(404).json({ message: "Negocio no encontrado" });
      }

      res
        .status(200)
        .json({
          message: "Negocio actualizado exitosamente.",
          updatedBusiness: updatedBusiness,
        });
    } catch (error) {
      console.error("Error al actualizar el negocio:", error);

      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({
            error: "Datos de entrada inválidos.",
            details: error.errors,
          });
      } else {
        return res
          .status(500)
          .json({ error: "Error al actualizar el negocio." });
      }
    }
  },
  pending_business: (req, res) => {
    const businessId = req.params._id; // Obtengo el ID del negocio desde los parámetros de la solicitud

    Business.findById(businessId)
      .select("-ownerId -ownerName -_id") // Busco el negocio por su ID y evito mostrar datos sensibles.
      .then((oneBusiness) => {
        if (!oneBusiness) {
          // Manejo el caso si el negocio no se encuentra
          return res.status(404).json({ message: "Negocio no encontrado" });
        }
        res.json(oneBusiness); // Envío los datos del negocio encontrado como respuesta
      })
      .catch((error) => {
        console.error("Error al buscar el negocio: ", error);
        res.status(500).json({ error: "Error al buscar el negocio" });
      });
  },
  active_business: (req, res) => {
    const businessId = req.params._id; // Obtengo el ID del negocio desde los parámetros de la solicitud

    Business.findById(businessId)
      .select("-ownerId -ownerName -_id") // Busco el negocio por su ID y evito mostrar datos sensibles.
      .then((oneBusiness) => {
        if (!oneBusiness) {
          // Manejo el caso si el negocio no se encuentra
          return res.status(404).json({ message: "Negocio no encontrado" });
        }
        res.json(oneBusiness); // Envío los datos del negocio encontrado como respuesta
      })
      .catch((error) => {
        console.error("Error al buscar el negocio: ", error);
        res.status(500).json({ error: "Error al buscar el negocio" });
      });
  },
};

export default controller;
