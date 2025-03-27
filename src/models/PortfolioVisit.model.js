import mongoose from "mongoose";

const portfolioVisitSchema = mongoose.Schema({
  count: { type: Number, default: 0 }
}, { collection: 'portfolioVisits' });  // Asegura que la colección se llame 'portfolioVisits'

const PortfolioVisit = mongoose.model("PortfolioVisit", portfolioVisitSchema);

export default PortfolioVisit;