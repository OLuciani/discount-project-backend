/* import mongoose from "mongoose";

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

export default UserDiscountQr; */



import mongoose from "mongoose";

const userDiscountQrSchema = mongoose.Schema({
    businessId: String,
    businessName: String,
    userId: String,
    offeredDiscountId: String,
    discountTitle: String,
    discountDetails: String,
    discountPrice: Number,
    createdAt: { type: Date, default: Date.now },
    isValid: { type: Boolean, default: true }, 
    isUsed: { type: Boolean, default: false }, 
    expirationDate: Date, 
});

const UserDiscountQr = mongoose.model("userDiscountQr", userDiscountQrSchema, "user_discount_qrs");

export default UserDiscountQr;
