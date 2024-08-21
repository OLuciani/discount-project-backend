/* import mongoose from "mongoose";
import dotenv from 'dotenv';
import Business from "../models/Business.model.js";

// Establezco la conexión a la base de datos con la URL almacenada en una variable de entorno
mongoose
  .connect("mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project")
  .then(() => console.log("Conectado a Base de Datos"));
// Establezco una opción adicional para consultas estrictas
mongoose.set("strictQuery", true);

console.log(Business);

dotenv.config();

const controller = {
  business_create: async (req, res) => {
    try {
      const {
        ownerName,
        businessName,
        businessType,
        address,
        latitude,
        longitude,
        ownerId,
      } = req.body;

      // Obtener la URL del archivo cargado
      let imageURL = '';

      if (req.file) {
        imageURL = "img/" + req.file.filename; // Usar la ruta relativa del archivo
      }



      const apiKey = process.env.HERE_API_KEY 

      if (!address) {
        return res.status(400).json({ error: 'La dirección del negocio es requerida.' });
      }

      let busineesLatitude = "";
      let businessLongitude = "";

      fetch(`https://geocode.search.hereapi.com/v1/geocode?q=${address}&apiKey=${apiKey}`)
        .then((response) => response.json())
        .then((data) => { console.log("Valor de position: ", data.items[0].position);
            if (data.length === 0) {
              return res.status(404).json({ error: 'No coordinates found for the provided address' });
            }

            busineesLatitude = data.items[0].position.lat;
            businessLongitude = data.items[0].position.lng;
            console.log("Valor de latitud: ", data.items[0].position.lat);
            console.log("Valor de longitud: ", data.items[0].position.lng);

        })





      const newBusiness = new Business({
        ownerName,
        businessName,
        businessType,
        address,
        latitude: busineesLatitude,
        longitude: businessLongitude,
        ownerId,
        imageURL,
      });

      const savedBusiness = await newBusiness.save();
      
      res.status(200).json({ message: 'El nuevo negocio se guardó exitosamente.', _id: savedBusiness._id, businessType: savedBusiness.businessType });

    } catch (error) {
      // Aquí manejo los errores en caso de que no se pueda guardar el negocio en la base de datos.
      console.error('Error en el registro del negocio:', error.message);
      res.status(500).json({ error: 'Error en el registro del negocio.' });
    }
  },
  business_list: (req, res) => {
    Business.find()
    .then((allBusiness) => res.json(allBusiness))
    .catch((error) => {
      console.error("Error al buscar negocios: ", error);
      res.status(500).json({ error: "Error al buscar negocios"});
    });
  },
  business_detail: (req, res) => {
    const businessId = req.params._id; // Obtenengo el ID del negocio desde los parámetros de la solicitud
    Business.findById(businessId) // Buscao el negocio por su ID
      .then((oneBusiness) => {
        if (!oneBusiness) { // Manejo el caso si el negocio no se encuentra
          return res.status(404).json({ message: "Negocio no encontrado" });
        }
        res.json(oneBusiness); // Envío los datos del negocio encontrado como respuesta
      })
      .catch((error) => {
        console.error("Error al buscar el negocio: ", error);
        res.status(500).json({ error: "Error al buscar el negocio" });
      });
  }
};

export default controller; */



import mongoose from "mongoose";
import dotenv from 'dotenv';
import Business from "../models/Business.model.js";
import User from "../models/User.model.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises"; // Importar fs para operaciones de sistema de archivos

dotenv.config();

// Establezco la conexión a la base de datos con la URL almacenada en una variable de entorno
mongoose
  .connect("mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project")
  .then(() => console.log("Conectado a Base de Datos"))
  .catch((error) => console.error('Error conectando a la base de datos:', error));

// Establezco una opción adicional para consultas estrictas
mongoose.set("strictQuery", true);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const controller = {
  /* business_create: async (req, res) => {
    try {
      const {
        ownerName,
        businessName,
        businessType,
        address,
        city,
        country,
        ownerId,
      } = req.body;

       // Validar campos obligatorios
       if (!ownerName || !businessName || !businessType || !address || !city || !country || !ownerId) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
      }

      // Obtener la URL del archivo cargado
      let imageURL = '';
      if (req.file) {
        imageURL = "img/" + req.file.filename; // Usar la ruta relativa del archivo
      }

      const apiKey = process.env.HERE_API_KEY;
      const fullAddress = `${address}, ${city}. ${country}`;

       // Verificar si la clave API está configurada
       if (!apiKey) {
        return res.status(500).json({ error: 'API Key para geocodificación no configurada.' });
      }

      // Realizo la solicitud a la API de geocodificación
      const response = await fetch(`https://geocode.search.hereapi.com/v1/geocode?q=${fullAddress}&apiKey=${apiKey}`);
      

      if (!response.ok) {
        return res.status(500).json({ error: 'Error al comunicarse con el servicio de geocodificación.' });
      }

      const data = await response.json();

      if (data.items.length === 0) {
        return res.status(404).json({ error: 'No se encontraron coordenadas para la dirección proporcionada.' });
      }


      const busineesLatitude = data.items[0].position.lat;
      const businessLongitude = data.items[0].position.lng;

      //console.log("Valor de latitud: ", busineesLatitude);
      //console.log("Valor de longitud: ", businessLongitude);

      const newBusiness = new Business({
        ownerName,
        businessName,
        businessType,
        address,
        city,
        country,
        latitude: busineesLatitude,
        longitude: businessLongitude,
        ownerId,
        imageURL,
      });

      const savedBusiness = await newBusiness.save();
      
      res.status(200).json({ message: 'El nuevo negocio se guardó exitosamente.', _id: savedBusiness._id, businessType: savedBusiness.businessType });

    } catch (error) {
      // Aquí manejo los errores en caso de que no se pueda guardar el negocio en la base de datos.
      console.error('Error en el registro del negocio:', error.message);
      res.status(500).json({ error: 'Error en el registro del negocio.' });

      // Gestión de errores más específica
      if (error.name === 'ValidationError') {
        res.status(400).json({ error: 'Datos de entrada inválidos.' });
      } else {
        res.status(500).json({ error: 'Error en el registro del negocio.' });
      }
    }
  }, */
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
      if (!ownerName || !businessName || !businessType || !address || !addressNumber || !city || !country || !ownerId) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
      }
  
      // Obtener la URL del archivo cargado
      let imageURL = '';
      /* if (req.file) {
        imageURL = "img/" + req.file.filename; // Usar la ruta relativa del archivo
      } */
      if (req.file && req.file.processedFilePath) {
        imageURL = "img/" + req.file.processedFilePath;
      }
  
      const apiKey = process.env.HERE_API_KEY;
  
      // Verificar si la clave API está configurada
      if (!apiKey) {
        return res.status(500).json({ error: 'API Key para geocodificación no configurada.' });
      }
  
      const fullAddress = `${address} ${addressNumber}, ${city}, ${country}`;
  
      // Realizo la solicitud a la API de geocodificación
      const response = await fetch(`https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(fullAddress)}&apiKey=${apiKey}`);
      
      if (!response.ok) {
        return res.status(500).json({ error: 'Error al comunicarse con el servicio de geocodificación.' });
      }
  
      const data = await response.json();
  
      if (data.items.length === 0) {
        return res.status(404).json({ error: 'No se encontraron coordenadas para la dirección proporcionada.' });
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
        imageURL,
      });
  
      const savedBusiness = await newBusiness.save();
      
      res.status(200).json({ message: 'El nuevo negocio se guardó exitosamente.', _id: savedBusiness._id, businessType: savedBusiness.businessType });
  
    } catch (error) {
      console.error('Error en el registro del negocio:', error.message);
  
      if (error.name === 'ValidationError') {
        res.status(400).json({ error: 'Datos de entrada inválidos.' });
      } else {
        res.status(500).json({ error: 'Error en el registro del negocio.' });
      }
    }
  },  
  business_list: (req, res) => {
    Business.find()
    .then((allBusiness) => res.json(allBusiness))
    .catch((error) => {
      console.error("Error al buscar negocios: ", error);
      res.status(500).json({ error: "Error al buscar negocios"});
    });
  },
  business_detail: (req, res) => {
    //const businessId = req.params._id; // Obtengo el ID del negocio desde los parámetros de la solicitud
    const mobileBusinessId = req.params._id;
    const { webBusinessId } = req.user; // Extrae businessId del objeto req.user (del token de la cookie).

    const businessId = "";

    if(mobileBusinessId) {
      businessId = mobileBusinessId
    } else {
      businessId = webBusinessId
    }

    Business.findById(businessId) // Busco el negocio por su ID
      .then((oneBusiness) => {
        if (!oneBusiness) { // Manejo el caso si el negocio no se encuentra
          return res.status(404).json({ message: "Negocio no encontrado" });
        }
        res.json(oneBusiness); // Envío los datos del negocio encontrado como respuesta
      })
      .catch((error) => {
        console.error("Error al buscar el negocio: ", error);
        res.status(500).json({ error: "Error al buscar el negocio" });
      });
  }, 
  update_business: async (req, res) => {
    const { businessId } = req.user; // Extrae businessId del objeto req.user (del token de la cookie).
    const { businessName, address, city, country, businessType} = req.body;

    let imageURL = "";

      const existingBusiness = await Business.findById(businessId);
      if (existingBusiness) {
        imageURL = existingBusiness.imageURL;
      }

      /* if (req.file) {
        imageURL = "img/" + req.file.filename; */
        if (req.file && req.file.processedFilePath) {
          imageURL = "img/" + req.file.processedFilePath;

        if (existingBusiness && imageURL !== existingBusiness.imageURL) {
          const existingImagePath = path.join(
            __dirname,
            "../../public",
            existingBusiness.imageURL
          );

          try {
            await fs.unlink(existingImagePath);
            console.log(
              "Imagen anterior eliminada:",
              existingBusiness.imageURL
            );
          } catch (error) {
            console.error("Error al eliminar la imagen anterior:", error);
          }
        }
      }
    //console.log("valor de address: ", address);
  
    // Validar campos obligatorios
    if (req.body.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar.' });
    }
  
    try {
      // Buscar el negocio por su ID y actualizarlo
      const updatedBusiness = await Business.findByIdAndUpdate(
        businessId,
        {businessName: businessName, 
          address: address, 
          city: city, 
          country: country, 
          businessType: businessType, 
          imageURL
        }, 
        { new: true, runValidators: true });
  
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Negocio no encontrado" });
      }
  
      res.status(200).json({ message: 'Negocio actualizado exitosamente.', updatedBusiness: updatedBusiness });
    } catch (error) {
      console.error('Error al actualizar el negocio:', error);
  
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Datos de entrada inválidos.', details: error.errors });
      } else {
        return res.status(500).json({ error: 'Error al actualizar el negocio.' });
      }
    }
  }
  
};

export default controller;
