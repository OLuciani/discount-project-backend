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
  validityPeriod: { type: Number, default: null }, // Campo opcional
  isActive: Boolean,
  isDeleted: {
    type: Boolean,
    default: false, // Por defecto, los descuentos no están eliminados
  },
  dateDiscountDeleted: {
    type: Date,
    default: null,
  },
  startDateTime: { type: Date }, // Fecha y hora de inicio del descuento (opcional)
  durationDays: { type: Number }, // Duración en días del descuento (opcional)
  expirationDate: {
    type: Date,
    default: function () {
      if (this.startDateTime && this.durationDays) {
        const expirationDate = new Date(this.startDateTime);
        expirationDate.setDate(expirationDate.getDate() + this.durationDays);
        return expirationDate;
      }
      return null;
    },
  },
  generatedDiscounts: {
    type: Number,
    default: 0, // Inicializa con 0 descuentos generados
  },
  usedDiscounts: {
    type: Number,
    default: 0, // Inicializa con 0 descuentos consumidos
  },
  discounts_views: { type: Number, default: 0 }, // Cuántas veces se vieron los detalles del descuento
  businessLocationLatitude: {
    type: Number,
    required: true,
  },
  businessLocationLongitude: {
    type: Number,
    required: true,
  },
});

const OfferedDiscount = mongoose.model(
  "offeredDiscount",
  offeredDiscountSchema,
  "offered_discounts"
);

export default OfferedDiscount;
