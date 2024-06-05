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
  discounts_list_one_business: (req, res) => {
    const businessId = req.params._id; // Obtengo el ID del negocio desde los parámetros de la solicitud
    OfferedDiscount.find({ businessId: businessId, isActive: true }) // Busco descuentos por el ID del negocio y que estén activos
      .then((allDiscounts) => {
        if (!allDiscounts || allDiscounts.length === 0) { // Manejo el caso si no se encuentran descuentos
          return res.status(404).json({ message: "Descuentos no encontrados" });
        }
        res.json(allDiscounts); // Envío los datos de los descuentos del negocio encontrados como respuesta
      })
      .catch((error) => {
        console.error("Error al buscar descuentos del negocio: ", error);
        res.status(500).json({ error: "Error al buscar descuentos del negocio" });
      });
  },
  discount_create: async (req, res) => {
    try {
      const {
        businessName,
        businessId,
        businessType,
        title,
        description,
        normalPrice,
        discountAmount,
        validityPeriod,
        isActive,
        expirationDate,
      } = req.body;

      // Obtener la URL del archivo cargado
      let imageURL = '';

      if (req.file) {
        imageURL = "img/" + req.file.filename; // Usar la ruta relativa del archivo
      }

      // Convierto normalPrice y discountAmount a números
      const normalPriceNumber = parseFloat(normalPrice);
      const discountAmountNumber = parseFloat(discountAmount);

      //Convierto isActive a boolean
      const isActiveBoolean = (isActive === 'true');

      const newPrice = normalPrice - (normalPrice * discountAmount / 100);

      const newOfferedDiscount = new OfferedDiscount({
        businessName,
        businessId,
        businessType,
        title,
        description,
        normalPrice: normalPriceNumber,
        priceWithDiscount: newPrice,
        discountAmount: discountAmountNumber,
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
