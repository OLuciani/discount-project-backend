import mongoose from "mongoose";

// Define el esquema del modelo de negocio
const pendingUsersSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: "pending" }, // O puedes definir otros roles según tu lógica
  created_at: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
});

// Crea el modelo de negocio
const PendingUsers = mongoose.model(
  "pendingUsers",
  pendingUsersSchema,
  "pendingUsers"
);

export default PendingUsers;
