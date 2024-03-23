import express from "express";
import path from "path";
//import cors from "cors";
import methodOverride from "method-override";
import dotenv from "dotenv";
import { fileURLToPath } from 'url'; // Esta línea importa la función fileURLToPath del módulo url de Node.js. Esta función se utiliza para convertir una URL de archivo en un camino de acceso de archivo.
import { dirname } from 'path'; // Aquí importo la función dirname del módulo path de Node.js. La función dirname se utiliza para obtener el nombre del directorio de un camino de acceso.

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url); // Aquí utilizo la función fileURLToPath para convertir la URL del módulo actual (import.meta.url) en un camino de acceso de archivo. Esto proporciona la ruta absoluta del archivo actual.
const __dirname = dirname(__filename); // Después de obtener el nombre del archivo con __filename, se utiliza la función dirname para obtener el nombre del directorio del archivo actual. Esto proporciona la ruta absoluta del directorio en el que se encuentra el archivo actual.


// Las líneas de código 6, 7, 13 y 14 las agregué porque en los módulos ESM (ECMAScript Modules), __dirname y __filename no están disponibles de la misma manera que en los módulos CommonJS. Por lo tanto, a estas líneas las utilizo para obtener el nombre del directorio y del archivo del módulo actual en un entorno de módulo ESM.
// Al agregar estas líneas, puedo utilizar __dirname y __filename en la aplicación de la misma manera que lo haría en un entorno de módulo CommonJS. Esto es especialmente útil cuando necesito obtener rutas absolutas para acceder a archivos en una aplicación.

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Middleware para manejar los encabezados CORS de manera personalizada
app.use((req, res, next) => {
    // Aquí definimos los orígenes permitidos y los métodos permitidos
    const allowedOrigins = ['http://localhost:8081'];
    const allowedMethods = ['GET', 'PATCH', 'PUT'];

    // Configuramos CORS para todas las rutas
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    res.header('Access-Control-Allow-Methods', allowedMethods.join(','));
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', true);

    // Verificamos si la solicitud es de un origen permitido
    if (allowedOrigins.includes(req.headers.origin)) {
        next();
    } else {
        res.status(403).json({ error: 'Origin not allowed' });
    }
});



//app.use(cors());
app.use(methodOverride('_method'));


//app.set('views', path.join(__dirname, '/views'));
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

console.log('Vistas:', path.join(__dirname, '/views'));


import mainRoute from "./routes/mainRoute.js";   //Hay que poner si o si .js
import usersRoute from "./routes/usersRoute.js";
import offeredDiscountsRoute from "./routes/offeredDiscountRoute.js";
import userDiscountQrsRoute from "./routes/userDiscountQrsRoute.js";

const PORT = process.env.PORT_SECRET || 5050;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

const BASE_API_PATH = "/api";
app.use("/", mainRoute);
app.use(BASE_API_PATH, usersRoute);
app.use(BASE_API_PATH, offeredDiscountsRoute);
app.use(BASE_API_PATH, userDiscountQrsRoute);
