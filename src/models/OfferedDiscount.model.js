import mongoose from "mongoose";

const offeredDiscountSchema = mongoose.Schema({
  businessId: String, // Referencia al negocio
  businessName: String,
  businessType: String,
  title: String,
  description: String,
  normalPrice: Number,
  priceWithDiscount: Number,
  discountAmount: Number,
  imageURL: String,
  validityPeriod: Date, //Corroborar si está bien.
  isActive: Boolean,
  isDeleted: {
    type: Boolean,
    default: false, // Por defecto, los descuentos no están eliminados
  },
  dateDiscountDeleted: {
    type: Date,
    default: null,
  },
  expirationDate: Date,
});

const OfferedDiscount = mongoose.model(
  "offeredDiscount",
  offeredDiscountSchema,
  "offered_discounts"
);

export default OfferedDiscount;
