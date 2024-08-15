import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises"; // Importar fs para operaciones de sistema de archivos
import { Decimal } from "decimal.js";

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
  discount_create: async (req, res) => {
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
      } = req.body;
  
      let imageURL = "";
  
      if (req.file && req.file.processedFilePath) {
        imageURL = "img/" + req.file.processedFilePath;
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
    OfferedDiscount.find({ businessId: businessId, isActive: true, isDeleted: false }) // Busco descuentos por el ID del negocio, que estén activos y no eliminados lógicamente
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
  
      res.status(200).json({
        message: "Descuento actualizado correctamente",
        discount: updatedDiscount,
      });
    } catch (error) {
      console.error("Error al actualizar el descuento:", error.message);
      res.status(500).json({ error: "Error al actualizar el descuento" });
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
      res
        .status(200)
        .json({
          success: true,
          message: "Descuento eliminado correctamente",
          discount: deletedDiscount, // Devuelve el descuento eliminado lógicamente
        });
    } catch (error) {
      // Captura cualquier error inesperado y devuelve una respuesta de error 500
      console.error(error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error al eliminar el descuento",
          error: error.message,
        });
    }
  },
};

export default controller;
