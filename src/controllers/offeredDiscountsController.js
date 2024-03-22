import mongoose from "mongoose";
//import jwt from "jsonwebtoken";

// Establezco la conexión a la base de datos con la URL almacenada en una variable de entorno
mongoose
  .connect("mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project")
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
      res.status(500).json({ error: "Error al buscar usuarios"});
    });
  }
};

export default controller;