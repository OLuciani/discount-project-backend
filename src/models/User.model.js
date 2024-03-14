import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    email: String, 
    password: String,
    es_admin: { type: Boolean, default: false } // Marca al usuario como usuario normal por defecto
});

const User = mongoose.model("user", userSchema);

export default User;