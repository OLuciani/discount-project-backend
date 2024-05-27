import mongoose from "mongoose";

// Establezco la conexión a la base de datos con la URL almacenada en una variable de entorno
mongoose
  .connect("mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project")
  .then(() => console.log("Conectado a Base de Datos"));
// Establezco una opción adicional para consultas estrictas
mongoose.set("strictQuery", true);

import Business from "../models/Business.model.js";

console.log(Business);

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

      const newBusiness = new Business({
        ownerName,
        businessName,
        businessType,
        address,
        latitude,
        longitude,
        ownerId,
        imageURL,
      });

      const savedBusiness = await newBusiness.save();

      if (!savedBusiness) {
        throw new Error('Error en el registro del negocio.');
      }

      // Aquí se envía una respuesta de éxito en el registro del negocio.
      res.status(200).json({ message: 'El nuevo negocio se guardó exitosamente.' });
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

export default controller;