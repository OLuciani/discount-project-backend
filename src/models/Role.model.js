import mongoose from "mongoose";

// Define el esquema del modelo de negocio
const roleSchema = mongoose.Schema({
    role_name: { type: String, required: true, unique: true },
    permissions: { type: [String], required: true }, // Un array de permisos
});

// Crea el modelo de negocio
const Role = mongoose.model(
  "role",
  roleSchema,
  "role"
);

export default PendingUsers;
