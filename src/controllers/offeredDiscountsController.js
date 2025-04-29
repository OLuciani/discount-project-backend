//import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises"; // Importar fs para operaciones de sistema de archivos
import { Decimal } from "decimal.js";
import { admin } from "../../config/firebase.js";

const bucket = admin.storage().bucket(); // Aquí puedes acceder al bucket de firebase

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
      // Guardamos el descuento sin validar el schema completo porque solo actualizamos campos existentes (eso lo hace { validateBeforeSave: false }).
      // Esto evita errores por campos requeridos (ej. coordenadas) que podrían estar ausentes en datos antiguos.
      await discount.save({ validateBeforeSave: false }); 
    }

    console.log(
      `Se desactivaron ${expiredDiscounts.length} descuentos expirados.`
    );
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
  
      const imageUrl = req.files.imageURL
        ? req.files.imageURL[0].firebaseUrl
        : null;
  
      console.log("Contenido de req.user:", req.user);
      if (!req.user || !req.user.businessId) {
        console.error("Falta el campo businessId en req.user");
        return res.status(400).json({ error: "Falta el campo businessId." });
      }
  
      // 💡 Corrección: Convertir a Decimal y redondear correctamente
      const normalPriceNumber = new Decimal(normalPrice).toFixed(2);
      const discountAmountNumber = new Decimal(discountAmount).toFixed(2);
  
      // Verificación de valores
      if (isNaN(normalPriceNumber) || isNaN(discountAmountNumber)) {
        return res.status(400).json({ error: "Valores inválidos para precios o descuento." });
      }
  
      // 💡 Corrección: Evitar errores de redondeo en la multiplicación
      const newPrice = new Decimal(normalPriceNumber)
        .times(new Decimal(1).minus(new Decimal(discountAmountNumber).div(100)))
        .toFixed(2);
  
      // Guardar la fecha en UTC sin modificarla manualmente
      const startDateTime = new Date();
  
      const durationDays = validityPeriod ? Number(validityPeriod) : null;
      let expirationDate = durationDays
        ? new Date(startDateTime.getTime() + durationDays * 24 * 60 * 60 * 1000)
        : null;
  
      // Si el subRole del usuario es "visit_user", establecer un tiempo de expiración de 30 minutos
      const { subRole } = req.user;
      const subRole_user = process.env.SUBROLE_VISIT_USER;
  
      if (subRole === subRole_user) {
        expirationDate = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 minutos
      }
  
      const newOfferedDiscount = new OfferedDiscount({
        businessName,
        businessId: req.user.businessId,
        businessType,
        title,
        description,
        normalPrice: Number(normalPriceNumber), // 💡 Guardarlo ya redondeado
        priceWithDiscount: Number(newPrice),
        discountAmount: Number(discountAmountNumber),
        imageURL: imageUrl,
        validityPeriod: durationDays,
        isActive: isActive === "true",
        startDateTime,
        durationDays,
        expirationDate,
        businessLocationLatitude: parseFloat(businessLocationLatitude),
        businessLocationLongitude: parseFloat(businessLocationLongitude),
      });
  
      // Guardar el descuento en la base de datos
      try {
        const savedDiscount = await newOfferedDiscount.save();
        console.log("Descuento guardado exitosamente:", savedDiscount);
  
        // Si el descuento es creado por un usuario con subRole "visit_user", programar su eliminación después de 30 minutos
        if (subRole === subRole_user) {
          setTimeout(async () => {
            try {
              await OfferedDiscount.findByIdAndDelete(savedDiscount._id);
              console.log(
                `Descuento con ID ${savedDiscount._id} eliminado automáticamente después de 30 minutos.`
              );
  
              if (savedDiscount.imageURL) {
                await deleteImageFromFirebase(savedDiscount.imageURL);
                console.log(`Imagen eliminada con éxito: ${savedDiscount.imageURL}`);
              }
            } catch (error) {
              console.error(
                `Error al eliminar el descuento o la imagen para el descuento con ID ${savedDiscount._id}`,
                error
              );
            }
          }, 30 * 60 * 1000); // 30 minutos en milisegundos
        }
  
        res.status(200).json({ message: "El descuento se guardó exitosamente." });
      } catch (dbError) {
        console.error("Error al guardar el descuento en la base de datos:", dbError);
        res.status(500).json({
          error: "Error al guardar el descuento en la base de datos.",
        });
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
  discount_update: async (req, res) => {
    const { businessId } = req.user;
    try {
      const { _id } = req.params;
      const {
        businessName,
        businessType,
        title,
        description,
        normalPrice,
        discountAmount,
        validityPeriod,
        isActive,
      } = req.body;

      console.log("VALOR DE NORMALPRICE DESDE EL FRONTEND: ", normalPrice, "Tipo:", typeof normalPrice);
      console.log("VALOR DE DISCOUNTAMOUNT DESDE EL FRONTEND: ", discountAmount, "Tipo:", typeof discountAmount);

      let imageURL = "";
      const existingDiscount = await OfferedDiscount.findById(_id);
      if (existingDiscount) {
        imageURL = existingDiscount.imageURL;
      }

      const newImageURL = req.files?.imageURL ? req.files.imageURL[0].firebaseUrl : null;
      if (newImageURL) {
        imageURL = newImageURL;
      }

      const isActiveBoolean = isActive === "true";

      // Asegurar que los valores de precios sean números válidos
      const normalPriceNumber = new Decimal(normalPrice).toFixed(2);
      const discountAmountNumber = new Decimal(discountAmount).toFixed(2);

      if (isNaN(normalPriceNumber) || isNaN(discountAmountNumber)) {
        return res.status(400).json({ error: "Valores inválidos para precios o descuento." });
      }

      // Cálculo del precio con descuento
      const newPrice = new Decimal(normalPriceNumber)
        .times(new Decimal(1).minus(new Decimal(discountAmountNumber).div(100)))
        .toFixed(2);


      let now, newExpirationDate, newStartDateTime, newDurationDays;
      const parsedValidityPeriod = Number(validityPeriod); // Asegurar que validityPeriod sea un número

      console.log("************parsedValidityPeriod************: ", parsedValidityPeriod);

      if (parsedValidityPeriod !== existingDiscount.validityPeriod) {
        now = new Date(); // Fecha actual UTC
        newStartDateTime = now;
        newDurationDays = parsedValidityPeriod;
        newExpirationDate = new Date(newStartDateTime.getTime() + newDurationDays * 24 * 60 * 60 * 1000);

        if (req.user.subRole === process.env.SUBROLE_VISIT_USER) {
          newExpirationDate = new Date(newStartDateTime.getTime() + 30 * 60 * 1000); // 30 minutos para VISIT_USER
        }

        console.log("parsedValidityPeriod: ", parsedValidityPeriod);

        // Si el usuario NO es VISIT_USER y validityPeriod es 0, expirationDate debe ser null
        if (req.user.subRole !== process.env.SUBROLE_VISIT_USER && parsedValidityPeriod === 0) {
          newExpirationDate = null;
        }
      }

      const updatedDiscount = await OfferedDiscount.findByIdAndUpdate(
        _id,
        {
          businessName,
          businessId,
          businessType,
          title,
          description,
          normalPrice: Number(normalPriceNumber), // Guardamos el precio ya redondeado
          priceWithDiscount: Number(newPrice),
          discountAmount: Number(discountAmountNumber),
          imageURL: imageURL,
          validityPeriod: parsedValidityPeriod,
          isActive: isActiveBoolean,
          expirationDate: /* parsedValidityPeriod === 0 ? null :
                           */(parsedValidityPeriod !== existingDiscount.validityPeriod ? newExpirationDate : existingDiscount.expirationDate),
          startDateTime: newStartDateTime || existingDiscount.startDateTime,
          durationDays: parsedValidityPeriod,
        },
        { new: true }
      );

      if (!updatedDiscount) {
        return res.status(404).json({ message: "Descuento no encontrado" });
      }

      console.log("Descuento actualizado correctamente:", updatedDiscount);
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
