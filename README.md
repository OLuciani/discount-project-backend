
# 🍽️ Comé x menos – Backend

Este es el repositorio del **backend** de **Comé x menos**, una plataforma de descuentos en tiempo real para restaurantes, bares, panaderías, cafés y otros comercios gastronómicos. Esta API sirve a dos clientes dentro de una misma **aplicación híbrida**:

- Una **aplicación web** creada con **Next.js** para administradores de negocios
- Una **aplicación móvil** creada con **React Native + Expo** para usuarios finales

---

## 🚀 Tecnologías utilizadas

- **Node.js** + **Express.js** – API RESTful
- **MongoDB Atlas** – Base de datos NoSQL en la nube
- **Firebase** – Almacenamiento de imágenes y autenticación parcial
- **Multer + Sharp** – Procesamiento de imágenes del lado del servidor
- **JWT + Cookies** – Autenticación segura con tokens firmados
- **Nodemailer** – Envío de correos de confirmación y recuperación
- **dotenv** – Manejo de variables de entorno
- **Helmet + CORS + Compression** – Seguridad y rendimiento

---

## 📁 Arquitectura del proyecto

El backend sigue una arquitectura **MVC modularizada**, dividiendo claramente responsabilidades por capas:

```
.
├── .env                     # Variables de entorno
├── config/                 # Configuraciones generales (Firebase, subida de imágenes, etc.)
├── src/
│   ├── controllers/        # Lógica de negocio asociada a rutas
│   ├── middlewares/        # Middlewares personalizados: autenticación, validaciones, subida de archivos, etc.
│   ├── models/             # Esquemas de Mongoose para los datos
│   ├── routes/             # Rutas del servidor agrupadas por entidad
│   ├── views/              # Vista EJS para pruebas puntuales
│   └── server.js           # Punto de entrada del servidor
└── package.json            # Dependencias y scripts del proyecto
```

Esta organización hace que el backend sea **escalable, mantenible y claro para nuevos desarrolladores**.

---

## 🔐 Autenticación y manejo de sesión

- **JWT** (JSON Web Tokens) firmados con secreto privado
- Tokens enviados y almacenados en **cookies HTTP-only** para mayor seguridad
- Roles definidos: `appAdmin`, `businessDirector`, `businessManager`, `businessEmployee`, `mobileCustomer`
- Tokens temporales para verificación de cuenta y restablecimiento de contraseña

---

## 📦 Instalación y ejecución

1. Clonar el repositorio:

```bash
git clone https://github.com/OLuciani/discount-project-backend.git
cd discount-project-backend-cookies
```

2. Instalar las dependencias:

```bash
npm install
```

3. Crear y configurar el archivo `.env`, copiando las siguientes variables y completando sus valores:

```
# 🌐 Configuración general
PORT=5050
FRONTEND_WEB_URL=https://discount-project-web.vercel.app

# 🔐 Secretos de autenticación
AUTH_SECRET=
RESET_TOKEN_SECRET=
CONFIRM_EMAIL_SECRET=
CREATE_USER_QR_SCANNER_SECRET=
CREATE_EXTRA_BUSINESS_ADMIN_USER_SECRET=
APP_MOBILE_SECRET=

# 🧑‍💼 Roles y subroles
ROLE_APP_ADMIN=
ROLE_BUSINESS_DIRECTOR=
ROLE_BUSINESS_MANAGER=
ROLE_BUSINESS_EMPLOYEE=
ROLE_MOBILE_CUSTOMER=
SUBROLE_VISIT_USER=

# 🗄️ Base de datos
URL_MONGODB_SECRET=

# 📧 Email (Nodemailer)
NODEMAILER_USER=
NODEMAILER_PASSWORD=
ADMIN_EMAILS=

# 📍 Servicios externos
HERE_API_KEY=

# 🔥 Firebase config (cliente)
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# 🔐 Firebase Admin SDK (cuenta de servicio)
SERVICE_ACCOUNT_TYPE=
SERVICE_ACCOUNT_PROJECT_ID=
SERVICE_ACCOUNT_PRIVATE_KEY_ID=
SERVICE_ACCOUNT_PRIVATE_KEY=
SERVICE_ACCOUNT_CLIENT_EMAIL=
SERVICE_ACCOUNT_CLIENT_ID=
SERVICE_ACCOUNT_AUTH_URI=
SERVICE_ACCOUNT_TOKEN_URI=
SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL=
SERVICE_ACCOUNT_CLIENT_X509_CERT_URL=
SERVICE_ACCOUNT_UNIVERSE_DOMAIN=

...
```

4. Iniciar el servidor:

```bash
npm start
```

Para desarrollo con reinicio automático:

```bash
npm run dev
```

---

## 🔄 Principales endpoints (resumen)

| Método | Ruta                              | Descripción                                      |
|--------|-----------------------------------|--------------------------------------------------|
| POST   | `/users/register`                 | Registro de nuevo usuario                        |
| POST   | `/users/login`                    | Inicio de sesión con JWT en cookies              |
| GET    | `/discounts/public`               | Obtener descuentos activos                       |
| POST   | `/business/create`                | Crear nuevo comercio (solo roles autorizados)    |
| PATCH  | `/discounts/:id/deactivate`       | Desactivar descuento vencido                     |
| GET    | `/admin/check-access`             | Verificar rol de administrador de app            |

> 🛡️ Todas las rutas protegidas utilizan middlewares de autenticación y autorización por rol.

---

## 🧠 Skills aplicadas

Durante el desarrollo de este backend, se pusieron en práctica habilidades clave como:

- Diseño e implementación de API RESTful
- Arquitectura modular basada en MVC
- Seguridad web: cookies seguras, validaciones, headers
- Gestión de archivos (imágenes/documentos) en servidores y en Firebase
- Uso de servicios externos (Firebase, Nodemailer, MongoDB Atlas)
- Control de flujo asíncrono con `async/await` y manejo de errores
- Versionamiento de código y uso profesional de Git y GitHub

---

## 🌍 Repositorios relacionados

- 📱 **Frontend móvil (React Native + Expo):** [Comé x menos - mobile](https://github.com/OLuciani/discount-project-mobile)  
- 💻 **Frontend web (Next.js):** [Comé x menos - web](https://github.com/OLuciani/discount-project-frontend)

Ambos repositorios son públicos y están pensados para funcionar en conjunto con este backend.

---

## ✅ Estado del repositorio

✔️ Variables de entorno y dependencias no están versionadas (ver `.gitignore`)  
✔️ Proyecto listo para despliegue o desarrollo colaborativo  
✔️ Documentación técnica y estructura clara

---

## 📬 Contacto

Desarrollado por **Oscar Luciani**  
[GitHub: @OLuciani](https://github.com/OLuciani)  
Proyecto académico con fines de aprendizaje y mejora continua.

---
