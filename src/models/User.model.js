import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: String,
    lastName: String,
    phone: String,
    businessName: String,
    businessId: String,
    businessType: String,
    email: String, 
    password: String,
    //isAdmin: { type: Boolean, default: false } // Marca al usuario como usuario normal por defecto
    role: String
});

const User = mongoose.model("user", userSchema);

export default User;



