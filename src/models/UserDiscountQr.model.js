import mongoose from "mongoose";

const userDiscountQrSchema = mongoose.Schema({
    businessId: String,
    businessName: String,
    userId: String,
    offeredDiscountId: String,
    discountTitle: String,
    discountDetails: String,
    createdAt: { type: Date, default: Date.now },
    isValid: { type: Boolean, default: true }, 
    isUsed: { type: Boolean, default: false }, 
    expirationDate: Date
});

const UserDiscountQr = mongoose.model("userDiscountQr", userDiscountQrSchema, "user_discount_qrs");

export default UserDiscountQr;

//Codigo mejorado y cambiando el nombre
/* import mongoose from "mongoose";

const userDiscountSchema = new mongoose.Schema({
    businessId: { type: String, required: true },
    businessName: { type: String, required: true },
    userId: { type: String, required: true },
    offeredDiscountId: { type: String, required: true },
    discountDetails: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    isValid: { type: Boolean, default: true }, 
    isUsed: { type: Boolean, default: false }, // Cambiado a isUsed para mayor claridad en español
    expirationDate: { type: Date, required: true }
});

const UserDiscount = mongoose.model("UserDiscount", userDiscountSchema, "user_discounts");

export default UserDiscount; */
