import PortfolioVisit from "../models/PortfolioVisit.model.js";

const controller = {
  visitCounter: async (req, res) => {
    console.log("Entrandoo al controller visitCounter");
    
    try {
      // Busca el documento del contador, si no existe, lo crea con count en 0
      let counter = await PortfolioVisit.findOne();

      if (!counter) {
        counter = new PortfolioVisit({ count: 0 });
      }

      // Incrementa el contador
      counter.count += 1;
      await counter.save();

      res.status(200).json({ success: true, count: counter.count });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al actualizar el contador", error });
    }
  },
};

export default controller;
