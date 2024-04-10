import mongoose from "mongoose";

const userDiscountQrSchema = mongoose.Schema({
    businessId: String,
    businessName: String,
    userId: String,
    offeredDiscountId: String,
    discountDetails: String,
    createdAt: { type: Date, default: Date.now },
    isValid: Boolean, 
    expirationDate: Date
});

const UserDiscountQr = mongoose.model("userDiscountQr", userDiscountQrSchema, "user_discount_qrs");

export default UserDiscountQr;