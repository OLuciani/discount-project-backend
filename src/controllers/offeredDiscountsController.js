import mongoose from "mongoose";
//import jwt from "jsonwebtoken";

// Establezco la conexión a la base de datos con la URL almacenada en una variable de entorno
mongoose
  .connect(
    "mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project"
  )
  .then(() => console.log("Conectado a Base de Datos"));
// Establezco una opción adicional para consultas estrictas
mongoose.set("strictQuery", true);

import OfferedDiscount from "../models/OfferedDiscount.model.js";

console.log(OfferedDiscount);

const controller = {
  discounts_list: (req, res) => {
    OfferedDiscount.find()
      .then((allDiscounts) => res.json(allDiscounts))
      .catch((error) => {
        console.error("Error al buscar usuarios: ", error);
        res.status(500).json({ error: "Error al buscar usuarios" });
      });
  },
  /* discount_create: (req, res) => {
    const {
      businessName,
      title,
      description,
      discountAmount,
      imageURL,
      validityPeriod,
      isActive,
      expirationDate,
    } = req.body;

    const newOfferedDiscount = new OfferedDiscount({
      businessName,
      title,
      description,
      discountAmount,
      imageURL,
      validityPeriod,
      isActive,
      expirationDate,
    });

    // Guarda al descuento en la base de datos
    newOfferedDiscount
      .save()
      .then((discount) => {
        // Aquí envío una respuesta de éxito en el registro. 
        res.json({ message: "El descuento se guardó exitosamente." });
      })
      .catch((error) => {
        // Aquí manejas los errores en caso de que no se pueda guardar el usuario en la base de datos
        res.status(500).json({ error: "Error en el registro del descuento." });
      });
  }, */
  discount_create: async (req, res) => {
    try {
      const {
        businessName,
        title,
        description,
        discountAmount,
        validityPeriod,
        isActive,
        expirationDate,
      } = req.body;

      // Obtener la URL del archivo cargado
      let imageURL = '';

      if (req.file) {
        imageURL = "/IMG/" + req.file.filename; // Usar la ruta relativa del archivo
      }

      const newOfferedDiscount = new OfferedDiscount({
        businessName,
        title,
        description,
        discountAmount,
        imageURL,
        validityPeriod,
        isActive,
        expirationDate,
      });

      const savedDiscount = await newOfferedDiscount.save();

      if (!savedDiscount) {
        throw new Error('Error en el registro del descuento.');
      }

      // Aquí se envía una respuesta de éxito en el registro.
      res.status(200).json({ message: 'El descuento se guardó exitosamente.' });
    } catch (error) {
      // Aquí manejo los errores en caso de que no se pueda guardar el descuento en la base de datos.
      console.error('Error en el registro del descuento:', error.message);
      res.status(500).json({ error: 'Error en el registro del descuento.' });
    }
  },
};

export default controller;
