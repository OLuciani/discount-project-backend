import mongoose from "mongoose";


const offeredDiscountSchema = mongoose.Schema({
    businessId: String, // Referencia al negocio
    title: String,
    description: String,
    discountAmount: Number,
    imageURL: String,
    validityPeriod: Date, //Corroborar si está bien.
    isActive: Boolean,
    expirationDate: Date
});

const OfferedDiscount = mongoose.model("offeredDiscount", offeredDiscountSchema, "offered_discounts");

export default OfferedDiscount;