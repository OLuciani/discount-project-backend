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
  discountQr_create: (req, res) => {
    const {userId, discountId, qrData, createdAt, isValid, expirationDate} = req.body;

    const newDiscountQr = new UserDiscountQr({
      userId: userId,
      discountId: discountId,
      qrData: qrData,
      createdAt: createdAt,
      isValid: isValid,
      expirationDate: expirationDate
    });

    // Guarda los datos del código QR del descuento en la base de datos
    newDiscountQr.save()
      .then((UserDiscountQr) => {
        // Aquí envío una respuesta de éxito en el registro de los datos del QR generado por el usuario. 
        res.json({ message: "Registro exitoso de los datos del QR del usuario" });
      })
      .catch((error) => {
        // Aquí manejas los errores en caso de que no se pueda guardar los datos del QR en la base de datos
        res.status(500).json({ error: "Error en el registro de los datos del QR del usuario" });
      });
  }
};

export default controller;