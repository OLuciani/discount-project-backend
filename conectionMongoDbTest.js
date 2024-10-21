import mongoose from "mongoose";

const URI_MONGO_DB = process.env.MONGO_URI; // Asegúrate de que esta variable esté configurada correctamente

async function testConnection() {
  try {
    await mongoose.connect(URI_MONGO_DB, { serverSelectionTimeoutMS: 5000 }); // 5 segundos
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  } finally {
    mongoose.connection.close();
  }
}

testConnection();
