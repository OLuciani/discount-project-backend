import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises'; // Importar fs para operaciones de sistema de archivos
import { Decimal } from 'decimal.js';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const controller = {
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

      console.log("Valor de normalPrice: ", normalPrice);
      console.log("Valor de discountAmount: ", discountAmount);

      // Convertir normalPrice y discountAmount a números decimales
      const normalPriceNumber = new Decimal(normalPrice);
      const discountAmountNumber = new Decimal(discountAmount);

      //Convierto isActive a boolean
      const isActiveBoolean = (isActive === 'true');

      /* const newPrice = normalPrice - (normalPrice * discountAmount / 100); */

      // Calcular el precio con descuento
      const newPrice = normalPriceNumber
        .times(1 - discountAmountNumber.div(100))
        .toDecimalPlaces(2)
        .toNumber();

      const newOfferedDiscount = new OfferedDiscount({
        businessName,
        businessId,
        businessType,
        title,
        description,
        normalPrice: normalPriceNumber.toNumber(),
        priceWithDiscount: newPrice,
        discountAmount: discountAmountNumber.toNumber(),
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
  discount_detail: (req, res) => {
    const discountId = req.params._id; // Obtengo el ID del negocio desde los parámetros de la solicitud

    OfferedDiscount.findById(discountId) // Busco el descuento por su ID
    .then((oneDiscount) => {
      if (!oneDiscount) { // Manejo el caso si el descuento no se encuentra
        return res.status(404).json({ message: "Descuento no encontrado" });
      }
      if(oneDiscount.isActive === true) {
        res.json(oneDiscount); // Envío los datos del descuento encontrado como respuesta
      } else {
        return res.status(404).json({ message: "El descuento no está activo en este momento." });
      }
    })
    .catch((error) => {
      console.error("Error al buscar el descuento: ", error);
      res.status(500).json({ error: "Error al buscar el descuento" });
    });
  },
  discount_update: async (req, res) => {
    try {
      const { _id } = req.params;
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

      let imageURL = '';

      const existingDiscount = await OfferedDiscount.findById(_id);
      if (existingDiscount) {
        imageURL = existingDiscount.imageURL;
      }

      if (req.file) {
        imageURL = "img/" + req.file.filename;

        if (existingDiscount && imageURL !== existingDiscount.imageURL) {
          const existingImagePath = path.join(__dirname, '../../public', existingDiscount.imageURL);

          try {
            await fs.unlink(existingImagePath);
            console.log('Imagen anterior eliminada:', existingDiscount.imageURL);
          } catch (error) {
            console.error('Error al eliminar la imagen anterior:', error);
          }
        }
      }

      const normalPriceNumber = new Decimal(normalPrice);
      const discountAmountNumber = new Decimal(discountAmount);
      const isActiveBoolean = isActive === 'true';
      const newPrice = normalPriceNumber
        .times(1 - discountAmountNumber.div(100))
        .toDecimalPlaces(2)
        .toNumber();

      const updatedDiscount = await OfferedDiscount.findByIdAndUpdate(
        _id,
        {
          businessName,
          businessId,
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

      res.status(200).json({ message: 'Descuento actualizado correctamente', discount: updatedDiscount });
    } catch (error) {
      console.error('Error al actualizar el descuento:', error.message);
      res.status(500).json({ error: 'Error al actualizar el descuento' });
    }
  }
};

export default controller;
