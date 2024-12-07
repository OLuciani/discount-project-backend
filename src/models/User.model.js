import mongoose from "mongoose";

// Definimos un subesquema para las notificaciones
const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true }, // Mensaje de la notificación
    timestamp: { type: Date, default: Date.now }, // Fecha y hora de la notificación
    read: { type: Boolean, default: false } // Indica si el usuario ha leído la notificación
});

// Esquema principal de usuario
const userSchema = new mongoose.Schema({
    name: String,
    lastName: String,
    phone: String,
    businessId: String,
    businessName: String,
    //businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'business' },
    email: { type: String, required: true, unique: true },
    originalEmail: { type: String, required: false },
    password: String,
    role: String,
    status: { type: String, enum: ["pending", "active", "rejected", "suspend"], default: "pending" },
    notifications: [notificationSchema], // Aquí añadimos el array de notificaciones, que sigue la estructura del subesquema `notificationSchema`
    firebaseUID: { type: String, required: true }, // Agrego el UID de Firebase
});

// Modelo de usuario
const User = mongoose.model("user", userSchema);

export default User;
