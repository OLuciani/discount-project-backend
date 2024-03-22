import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: String,
    lastName: String,
    dni: String,
    businessName: String,
    email: String, 
    password: String,
    isAdmin: { type: Boolean, default: false } // Marca al usuario como usuario normal por defecto
});

const User = mongoose.model("user", userSchema);

export default User;



