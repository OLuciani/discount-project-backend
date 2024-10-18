/* import mongoose from "mongoose";

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
    pdfBusinessRegistration: String,
    //role: String,
    role: { type: String, default: "user" }, // Rol inicial
    status: { type: String, enum: ["pending", "active", "rejected", "suspend"], default: "pending" },
    notifications: [notificationSchema] // Aquí se añaden las notificaciones
});

const User = mongoose.model("user", userSchema);

export default User; */



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
    businessName: String,
    businessId: String,
    businessType: String,
    email: { type: String, required: true, unique: true },
    originalEmail: { type: String, required: false },
    password: String,
    pdfBusinessRegistration: String,
    role: { type: String, default: "user" },
    status: { type: String, enum: ["pending", "active", "rejected", "suspend"], default: "pending" },
    notifications: [notificationSchema] // Aquí añadimos el array de notificaciones, que sigue la estructura del subesquema `notificationSchema`
});

// Modelo de usuario
const User = mongoose.model("user", userSchema);

export default User;
