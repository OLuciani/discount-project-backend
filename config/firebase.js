import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import dotenv from 'dotenv';
import admin from "firebase-admin";
import { getStorage } from "firebase/storage";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

console.log("Inicializando Firebase con la siguiente configuración:", firebaseConfig);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configuración de Firebase Storage
const storage = getStorage(app); // Inicializo Firebase Storage

// Configuración de Firebase Admin SDK
const adminConfig = {
    "type": process.env.SERVICE_ACCOUNT_TYPE,
    "project_id": process.env.SERVICE_ACCOUNT_PROJECT_ID,
    "private_key_id": process.env.SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    "private_key": process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
    "client_id": process.env.SERVICE_ACCOUNT_CLIENT_ID,
    "auth_uri": process.env.SERVICE_ACCOUNT_AUTH_URI,
    "token_uri": process.env.SERVICE_ACCOUNT_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
    "universe_domain": process.env.SERVICE_ACCOUNT_UNIVERSE_DOMAIN,
  };

// Inicializa Firebase Admin SDK si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Añadimos el storageBucket para Firebase Storage
  });
}

export { auth, sendPasswordResetEmail, admin, storage };

