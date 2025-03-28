import PortfolioVisit from "../models/PortfolioVisit.model.js";

const controller = {
  visitCounter: async (req, res) => {
    console.log("Entrandoo al controller visitCounter");
    
    try {
      // Busca el documento y actualiza directamente el campo "count"
      const result = await PortfolioVisit.findOneAndUpdate(
        {}, // No uso un filtro porque solo hay un documento
        { $inc: { count: 1 } }, // Incremento el campo "count"
        { new: true } // Devuelve el documento actualizado
      );

      // Devuelve el valor actualizado del contador
      res.status(200).json({ success: true, count: result.count });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al actualizar el contador", error });
    }
  },
};

export default controller;

