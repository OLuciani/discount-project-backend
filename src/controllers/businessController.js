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