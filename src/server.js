import express from "express";
import path from "path";
import cors from "cors";
import methodOverride from "method-override";
import dotenv from "dotenv";
import { fileURLToPath } from 'url'; // Esta línea importa la función fileURLToPath del módulo url de Node.js. Esta función se utiliza para convertir una URL de archivo en un camino de acceso de archivo.
import { dirname } from 'path'; // Aquí importo la función dirname del módulo path de Node.js. La función dirname se utiliza para obtener el nombre del directorio de un camino de acceso.
import cookieParser from "cookie-parser";
import { deactivateExpiredDiscounts } from "./controllers/offeredDiscountsController.js";
import mongoose from "mongoose";


dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url); // Aquí utilizo la función fileURLToPath para convertir la URL del módulo actual (import.meta.url) en un camino de acceso de archivo. Esto proporciona la ruta absoluta del archivo actual.
const __dirname = dirname(__filename); // Después de obtener el nombre del archivo con __filename, se utiliza la función dirname para obtener el nombre del directorio del archivo actual. Esto proporciona la ruta absoluta del directorio en el que se encuentra el archivo actual.

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: true })); //Antes de configurar el middleware validationsLogin.js la tenia con valor false.
app.use(express.json());

// Middleware para habilitar CORS
app.use(cors({
  //origin: 'http://localhost:8081',
  origin: [process.env.FRONTEND_WEB_URL, 'http://localhost:8081'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Manejo de preflight requests
app.options('*', cors({
  //origin: 'http://localhost:8081',
  origin: [process.env.FRONTEND_WEB_URL, 'http://localhost:8081'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(methodOverride('_method', {
  methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE']
}));

//app.set('views', path.join(__dirname, '/views'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Configuración de middleware cookieParser
app.use(cookieParser());

// Ruta de prueba para verificar el middleware de cookies
app.get('/test-cookies', (req, res) => {
  console.log(req.cookies); // Esto debería mostrar todas las cookies recibidas en la consola
  res.send('Check your console for cookies!');
});

app.get('/set-cookie', (req, res) => {
  res.cookie('testCookie', 'testValue', { httpOnly: true });
  res.send('Cookie has been set!');
});

console.log('Vistas:', path.join(__dirname, '/views'));


// Conexión a la base de datos MongoDB
mongoose.connect(
  "mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project",
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
  console.log("Conectado a la Base de Datos MongoDB");

  // Llamo a la función para desactivar descuentos expirados al iniciar la aplicación
  deactivateExpiredDiscounts();

  // Llamo a la función periódicamente cada hora
  setInterval(deactivateExpiredDiscounts, 60 * 60 * 1000); // Ejecutar cada hora
}).catch((error) => {
  console.error("Error de conexión a la Base de Datos MongoDB:", error);
});

// Importación de rutas
import mainRoute from "./routes/mainRoute.js";   //Hay que poner si o si .js
import usersRoute from "./routes/usersRoute.js";
import offeredDiscountsRoute from "./routes/offeredDiscountRoute.js";
import userDiscountQrsRoute from "./routes/userDiscountQrsRoute.js";
import businessRoute from "./routes/businessRoute.js";
//import dashboardRoute from "./routes/dashboardRoute.js";



// Definición de rutas
const BASE_API_PATH = "/api";
app.use("/", mainRoute);
app.use(BASE_API_PATH, usersRoute);
app.use(BASE_API_PATH, offeredDiscountsRoute);
app.use(BASE_API_PATH, userDiscountQrsRoute);
app.use(BASE_API_PATH, businessRoute);
//app.use(BASE_API_PATH, dashboardRoute);


const PORT = process.env.PORT_SECRET || 5050; //Descomentar para pushear.
//const PORT = 5050;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});