import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: String,
    lastName: String,
    phone: String,
    businessName: String,
    businessId: String,
    businessType: String,
    //email: String,
    email: { type: String, required: true, unique: true }, // Normalized email
    originalEmail: { type: String, required: false }, // Original email 
    password: String,
    //isAdmin: { type: Boolean, default: false } // Marca al usuario como usuario normal por defecto
    role: String
});

const User = mongoose.model("user", userSchema);

export default User;



