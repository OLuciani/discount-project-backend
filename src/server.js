import express from "express";
import path from "path";
import cors from "cors";
import methodOverride from "method-override";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cookieParser from "cookie-parser";
//import compression from "compression"; // Importar el middleware de compresión
import { deactivateExpiredDiscounts } from "./controllers/offeredDiscountsController.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware de compresión
//app.use(compression());

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const corsOptions = {
  origin: [process.env.FRONTEND_WEB_URL, 'http://localhost:8081', 'http://localhost:5173', process.env.PORTFOLIO_URL],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware para habilitar CORS
app.use(cors(corsOptions));

// Manejo de preflight requests (opcional)
app.options('*', cors(corsOptions));

app.use(methodOverride('_method', {
  methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE']
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configuración de middleware cookieParser
app.use(cookieParser());

// Ruta de prueba para verificar el middleware de cookies
app.get('/test-cookies', (req, res) => {
  console.log(req.cookies);
  res.send('Check your console for cookies!');
});

app.get('/set-cookie', (req, res) => {
  res.cookie('testCookie', 'testValue', { httpOnly: true, secure: false, sameSite: 'Lax' });
  res.send('Cookie has been set!');
});

console.log('Vistas:', path.join(__dirname, '/views'));

async function connectToDatabase() {
  try {
    const URI_MONGO_DB = process.env.URL_MONGODB_SECRET;
    await mongoose.connect(URI_MONGO_DB, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("Conectado a la Base de Datos MongoDB");
  } catch (error) {
    console.error("Error de conexión a la Base de Datos MongoDB:", error);
  }
}

// Llamada a la función de conexión
connectToDatabase();

mongoose.set("strictQuery", true);

deactivateExpiredDiscounts();

setInterval(deactivateExpiredDiscounts, 60 * 60 * 1000);

import mainRoute from "./routes/mainRoute.js";
import usersRoute from "./routes/usersRoute.js";
import offeredDiscountsRoute from "./routes/offeredDiscountRoute.js";
import userDiscountQrsRoute from "./routes/userDiscountQrsRoute.js";
import businessRoute from "./routes/businessRoute.js";
import checkAccountRoute from "./routes/checkAccountRoute.js";
import checkAdminAppRoute from "./routes/checkAdminAppRoute.js";
import portfolioVisitRoute from "./routes/portfolioVisitRoute.js"

const BASE_API_PATH = "/api";
app.use("/", mainRoute);
app.use(BASE_API_PATH, usersRoute);
app.use(BASE_API_PATH, offeredDiscountsRoute);
app.use(BASE_API_PATH, userDiscountQrsRoute);
app.use(BASE_API_PATH, businessRoute);
app.use(BASE_API_PATH, checkAccountRoute);
app.use(BASE_API_PATH, checkAdminAppRoute);
app.use(BASE_API_PATH, portfolioVisitRoute);

const PORT = process.env.PORT || 5050;
//const PORT = 5050;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
