/* import mongoose from "mongoose";

const businessSchema = mongoose.Schema({
    ownerName: String,
    businessName: String,
    businessType: String,
    address: String,
    latitude: Number,
    longitude: Number,
    ownerId: String,
    imageURL: String,
});

const Business = mongoose.model("business", businessSchema);

export default Business; */


import mongoose from "mongoose";

// Define el esquema del modelo de negocio
const businessSchema = mongoose.Schema({
    ownerName: String,
    businessName: String,
    businessType: String,
    address: String,
    addressNumber: String,
    city: String,
    country: String,
    latitude: {
        type: Number,
        get: v => {
            return parseFloat(v).toFixed(7); // Convierte el valor a Double
        },
        set: v => {
            return parseFloat(v).toFixed(7); // Convierte el valor a Double
        }
    },
    longitude: {
        type: Number,
        get: v => {
            return parseFloat(v).toFixed(7); // Convierte el valor a Double
        },
        set: v => {
            return parseFloat(v).toFixed(7); // Convierte el valor a Double
        }
    },
    ownerId: String,
    imageURL: String,
});

// Crea el modelo de negocio
const Business = mongoose.model("business", businessSchema);

export default Business;
