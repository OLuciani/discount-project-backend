import mongoose from "mongoose";
//import jwt from "jsonwebtoken";

// Establezco la conexión a la base de datos con la URL almacenada en una variable de entorno
mongoose
  .connect("mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project")
  .then(() => console.log("Conectado a Base de Datos"));
// Establezco una opción adicional para consultas estrictas
mongoose.set("strictQuery", true);

import UserDiscountQr from "../models/UserDiscountQr.model.js";

console.log(UserDiscountQr);

const controller = {
    userDiscountQrs_list: (req, res) => {
    UserDiscountQr.find()
    .then((allDiscountQrs) => res.json(allDiscountQrs))
    .catch((error) => {
      console.error("Error al buscar usuarios: ", error);
      res.status(500).json({ error: "Error al buscar usuarios"});
    });
  }, 
  userDiscountQrs_OneUser: (req, res) => {
    const userId = req.params._id; // Obtener el ID de usuario de los parámetros de la solicitud
    UserDiscountQr.find({ userId: userId }) // Buscar descuentos con el ID de usuario proporcionado
    .then((userDiscountQrs) => {
        res.json(userDiscountQrs); // Enviar los descuentos encontrados como respuesta
    })
    .catch((error) => {
        console.error("Error al buscar descuentos de usuario: ", error);
        res.status(500).json({ error: "Error al buscar descuentos de usuario" });
    });
},
  discountQr_create: (req, res) => {
    const {businessId, businessName, userId, offeredDiscountId, discountDetails, createdAt, isValid, expirationDate} = req.body;

    const newDiscountQr = new UserDiscountQr({
      businessId: businessId,
      businessName: businessName,
      userId: userId,
      offeredDiscountId: offeredDiscountId,
      discountDetails: discountDetails,
      createdAt: createdAt,
      isValid: isValid,
      expirationDate: expirationDate
    });

    // Guarda los datos del código QR del descuento en la base de datos
    newDiscountQr.save()
      .then((UserDiscountQr) => {
        // Aquí envío una respuesta de éxito en el registro de los datos del QR generado por el usuario. 
        res.json({ 
          message: "Registro exitoso de los datos del QR del usuario", 
          discountQrId: UserDiscountQr._id // Recupero el ID del nuevo documento en base de datos.
        });
      })
      .catch((error) => {
        // Aquí manejas los errores en caso de que no se pueda guardar los datos del QR en la base de datos
        res.status(500).json({ error: "Error en el registro de los datos del QR del usuario" });
      });
  },
  userDiscountQrs_oneDiscount: (req, res) => {
    const discountId = req.params._id; // Obtener el ID del descuento de los parámetros de la solicitud
    UserDiscountQr.find({ _id: discountId }) // Buscar el descuento con el ID que llega por params
    .then((discountFound) => {
        res.json(discountFound); // Enviar el descuento encontrado como respuesta
    })
    .catch((error) => {
        console.error("Error al buscar el descuento con el id: ", error);
        res.status(500).json({ error: "Error al buscar el descuento con el id." });
    });
  },
  discount_update: (req, res) => {
    //Recupero el id para buscar el descuenteo que quiero actualizar en Base de Datos.
    const discountId = req.params._id;
    console.log("ID del descuento recibido:", discountId);

    //Extraigo los datos que quiero actualizar desde la solicitud put
    const { isValid } = req.body;

    //Creo un objeto con los datos a actualizar en el descuento en Base de Datos.
    const updatedDiscount = {
      isValid
    };

    UserDiscountQr.findByIdAndUpdate(discountId, updatedDiscount, {new: true})
    .then((updatedDiscount) => {
      if (!updatedDiscount) {
        // Si no se encontró el descuento, responde con un error 404
        return res.status(404).json({ error: "Descuento no encontrado" });
      }

      console.log("La propiedad isValid del descuento escaneado se ha actualizado correctamente:", updatedReservation);
      res.status(200).json(updatedDiscount);
    })
    .catch((error) => {
      console.error("Error al actualizar la propiedad isValid del descuento escaneado:", error);
      res.status(500).json({ error: "Error al actualizar la propiedad isValid del descuento escaneado." });
    });


  }
};

export default controller;