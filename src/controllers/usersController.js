//Este codigo funciona perfecto sin el reestablecimiento de la contraseña
/* import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult} from "express-validator";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

// Establezco la conexión a la base de datos con la URL almacenada en una variable de entorno
mongoose
  .connect("mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project")
  .then(() => console.log("Conectado a Base de Datos"));
// Establezco una opción adicional para consultas estrictas
mongoose.set("strictQuery", true);

import User from "../models/User.model.js";

console.log(User);

const transporterPassword = process.env.NODEMAILER_PASSWORD;


// Configuro el transporte
const transporter = nodemailer.createTransport({
  service: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "lucianioscar1@gmail.com",
    pass: transporterPassword,
  },
});


// Función para enviar el correo electrónico
const sendEmail = async (email, token) => {
  try {
    // Defino el mensaje de correo electrónico
    const mailOptions = {
      from: "lucianioscar1@gmail.com",
      to: email,
      subject: "Solicitud de restablecimiento de contraseña",
      text: `Se ha solicitado un restablecimiento de contraseña. Utiliza el siguiente token para completar el proceso: ${token}`,
      html: `
        <h5>Este mensaje fue enviado desde nodemailer.</h5>
      `
    };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);
    console.log("Correo electrónico enviado con éxito");
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    throw error;
  }
}; 


const controller = {
  users_list: (req, res) => {
    User.find()
    .then((allUsers) => res.json(allUsers))
    .catch((error) => {
      console.error("Error al buscar usuarios: ", error);
      res.status(500).json({ error: "Error al buscar usuarios"});
    });
  },
  user_register: (req, res) => {
    const { name, lastName, phone, email, password, businessName, businessId, businessType } = req.body;
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Error en el registro" });
        }
  
        bcrypt.hash(password, salt, (err, hashedPassword) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error en el registro" });
          }
  
          const newUser = new User({
            name, 
            lastName, 
            businessName,
            businessId,
            businessType,
            phone, 
            email,
            password: hashedPassword,
            //isAdmin: isAdmin || false, // Marca al usuario como usuario normal
            role: "user", // Marca al usuario como usuario normal
          });
  
          // Guarda al usuario en la base de datos
          newUser.save()
            .then((user) => {
              // Aquí envío una respuesta de éxito en el registro. 
              res.json({ message: "Registro exitoso como usuario", _id: user._id, name: user.name, lastName: user.lastName });
            })
            .catch((error) => {
              // Aquí manejas los errores en caso de que no se pueda guardar el usuario en la base de datos
              res.status(500).json({ error: "Error en el registro" });
            });
        });
      });
    
  },
  user_update: async (req, res) => {
    try {
      const userId = req.params._id; // Obtener el ID del usuario desde los parámetros de la solicitud
      const { businessId, businessType } = req.body; // Obtener businessId del cuerpo de la solicitud

      // Aquí actualizamos el usuario con el businessId proporcionado
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { businessId, businessType },
        { new: true } // Esto es para devolver el documento actualizado
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.status(200).json({ message: "Usuario actualizado correctamente con businessId y businessType.", updatedUser });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error.message);
      res.status(500).json({ error: "Error al actualizar el usuario con businessId y businessType." });
    }
  },
  login: async (req, res) => {
    console.log("Solicitud de inicio de sesión recibida");
    console.log("Datos de la solicitud:", req.body);

    const { email, password } = req.body;

    console.log("Email recibido:", email);
    console.log("Contraseña recibida:", password);

    // Verificar si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Devolver errores de validación como un array en JSON
    }

    try {
        const user = await User.findOne({ email }); // Utilizar await para esperar la promesa de búsqueda

        if (!user) {
            console.log("Usuario no encontrado");
            return res.status(401).json({ message: "Usuario no registrado" });
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Si las contraseñas coinciden, generar un token
        //const token = jwt.sign({ userId: user._id, email: user.email }, 'mi_secreto_secreto', { expiresIn: '15m' });
        const token = jwt.sign(
          { userId: user._id, email: user.email, role: user.role }, // Añadir el rol del usuario al payload del token
          'mi_secreto_secreto',
          { expiresIn: '15m' }
      );

        // Enviar una respuesta con el token, el rol del usuario y el id del usuario.
        //res.json({ message: "Inicio de sesión exitoso", token, _id: user._id, role: user.isAdmin ? 'admin' : 'user' });
        res.json({ message: "Inicio de sesión exitoso", token, _id: user._id, role: user.role, name: user.name, businessName: user.businessName, businessId: user.businessId, businessType: user.businessType});

    } catch (error) {
        console.error("Error al buscar el usuario:", error);
        res.status(500).json({ message: "Error en la autenticación" });
    }
  },
  checkEmail: async (req, res) => {
    const email = req.params.email;
  
    try {
      // Si no encuentras el usuario, no importa, igual envía el correo electrónico
      const user = await User.findOne({ email });

      const token = jwt.sign({ email }, "tu_secreto", { expiresIn: "15m" });

      // Intenta enviar el correo electrónico
      await sendEmail(email, token);
      res.json({
        exists: !!user, // Si el usuario existe, devuelve true
        success: true,
        message: "Correo electrónico enviado correctamente",
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  }
  
};

export default controller; */

//Este codigo funciona perfecto pero sin enviar email con el token de firebase. tiene agregado el controller sendResetFirebaseEmail  que no deberia ir.
/* import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';


dotenv.config();

// Establecemos la conexión a la base de datos
mongoose.connect("mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project")
  .then(() => console.log("Conectado a la Base de Datos"))
  .catch(error => console.error("Error al conectar a la Base de Datos:", error));
mongoose.set("strictQuery", true);

import User from "../models/User.model.js";

// Configuramos el transporte para enviar correos electrónicos
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_USER,  // Aquí usamos la dirección de correo electrónico de Gmail
    pass: process.env.NODEMAILER_PASSWORD  // Aquí usamos la contraseña de aplicación generada
  }
});

// Función para enviar el correo electrónico
const sendEmail = async (email, token) => {
  try {
    // Definimos el mensaje de correo electrónico
    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Solicitud de restablecimiento de contraseña",
      text: `Se ha solicitado un restablecimiento de contraseña. Utiliza el siguiente token para completar el proceso: ${token}`,
      html: `
        <h5>Se ha solicitado un restablecimiento de contraseña.</h5>
        <p>Utiliza el siguiente token para completar el proceso:</p>
        <p><strong>${token}</strong></p>
      `
    };

    // Enviamos el correo electrónico
    await transporter.sendMail(mailOptions);
    console.log("Correo electrónico enviado con éxito");
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    throw error;
  }
};

// Controlador con las operaciones de usuario
const controller = {
  users_list: async (req, res) => {
    try {
      const allUsers = await User.find();
      res.json(allUsers);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      res.status(500).json({ error: "Error al buscar usuarios" });
    }
  },

  user_register: async (req, res) => {
    const { name, lastName, phone, email, password, businessName, businessId, businessType } = req.body;

    try {
      // Verificamos si ya existe un usuario con ese correo electrónico
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "El correo electrónico ya está registrado" });
      }

      // Encriptamos la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Creamos un nuevo usuario
      const newUser = new User({
        name,
        lastName,
        businessName,
        businessId,
        businessType,
        phone,
        email,
        password: hashedPassword,
        role: "user", // Establecemos el rol como "user"
      });

      // Guardamos el nuevo usuario en la base de datos
      await newUser.save();

      res.json({ message: "Registro exitoso como usuario", _id: newUser._id, name: newUser.name, lastName: newUser.lastName });
    } catch (error) {
      console.error("Error en el registro:", error);
      res.status(500).json({ error: "Error en el registro" });
    }
  },

  user_update: async (req, res) => {
    const userId = req.params._id;
    const { businessId, businessType } = req.body;

    try {
      // Actualizamos el usuario con el businessId proporcionado
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { businessId, businessType },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({ message: "Usuario actualizado correctamente", updatedUser });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    // Verificamos si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Buscamos al usuario por su correo electrónico
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Usuario no registrado" });
      }

      // Comparamos la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      // Generamos un token JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        'mi_secreto_secreto',
        { expiresIn: '15m' }
      );

      // Devolvemos una respuesta con el token y los detalles del usuario
      res.json({ message: "Inicio de sesión exitoso", token, _id: user._id, role: user.role, name: user.name, businessName: user.businessName, businessId: user.businessId, businessType: user.businessType });

    } catch (error) {
      console.error("Error al buscar el usuario:", error);
      res.status(500).json({ message: "Error en la autenticación" });
    }
  },

  checkEmail: async (req, res) => {
    const email = req.params.email;

    try {
      // Verificamos si existe un usuario con ese correo electrónico
      const user = await User.findOne({ email });

      if (!user) {
        // Si no se encuentra el usuario, igual enviamos el correo electrónico (opcional)
        console.log("Correo electrónico no encontrado en la base de datos, pero se enviará el correo de restablecimiento de contraseña.");
      }

      // Generamos un token JWT
      const token = jwt.sign({ email }, "mi_secreto_secreto", { expiresIn: "15m" });

      // Intentamos enviar el correo electrónico
      await sendEmail(email, token);

      res.json({
        exists: !!user, // Si el usuario existe, devuelve true
        success: true,
        message: "Correo electrónico enviado correctamente",
        token,
      });

    } catch (error) {
      console.error("Error al enviar el correo electrónico:", error);
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  },
  resetPassword: async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        console.log("Recibiendo datos para resetear contraseña:", email, newPassword);

        // Verificar si el usuario existe
        const user = await User.findOne({ email });

        if (!user) {
            console.log("Usuario no encontrado en la base de datos");
            return res.status(404).json({ message: "No se encontró ningún usuario con este correo electrónico" });
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña del usuario
        user.password = hashedPassword;
        await user.save();

        // Enviar un correo electrónico de confirmación
        const mailOptions = {
            from: process.env.NODEMAILER_USER,
            to: email,
            subject: "Confirmación de cambio de contraseña",
            text: "Tu contraseña ha sido cambiada exitosamente.",
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar el correo electrónico:", error);
            } else {
                console.log("Correo electrónico enviado:", info.response);
            }
        });

        console.log("Contraseña actualizada correctamente");
        res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error("Error al restablecer la contraseña:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
},
sendResetFirebaseEmail: async (req, res) => {
  const { email } = req.body;

  try {
    await sendPasswordResetEmail(auth, email);
    res.status(200).send({ message: "Correo de restablecimiento enviado correctamente" });
  } catch (error) {
    res.status(500).send({ error: "Error al enviar correo de restablecimiento" });
  }
}

};

export default controller; */

//Este codigo llego a enviar un par de mails con el token de firebase y dejo de funcionar
/* import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import { auth, sendPasswordResetEmail } from "../../config/firebase-config.js";

//import { auth } from "../../config/firebase-config.js";
//import { sendPasswordResetEmail } from "firebase/auth";


dotenv.config();

// Establecemos la conexión a la base de datos
mongoose.connect("mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project")
  .then(() => console.log("Conectado a la Base de Datos"))
  .catch(error => console.error("Error al conectar a la Base de Datos:", error));
mongoose.set("strictQuery", true);

import User from "../models/User.model.js";

// Configuramos el transporte para enviar correos electrónicos
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_USER,  // Aquí usamos la dirección de correo electrónico de Gmail
    pass: process.env.NODEMAILER_PASSWORD  // Aquí usamos la contraseña de aplicación generada
  }
});

// Función para enviar el correo electrónico
const sendEmail = async (email, token) => {
  try {
    // Definimos el mensaje de correo electrónico
    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Solicitud de restablecimiento de contraseña",
      text: `Se ha solicitado un restablecimiento de contraseña. Utiliza el siguiente token para completar el proceso: ${token}`,
      html: `
        <h5>Se ha solicitado un restablecimiento de contraseña.</h5>
        <p>Utiliza el siguiente token para completar el proceso:</p>
        <p><strong>${token}</strong></p>
      `
    };

    // Enviamos el correo electrónico
    await transporter.sendMail(mailOptions);
    console.log("Correo electrónico enviado con éxito");
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    throw error;
  }
};

// Controlador con las operaciones de usuario
const controller = {
  users_list: async (req, res) => {
    try {
      const allUsers = await User.find();
      res.json(allUsers);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      res.status(500).json({ error: "Error al buscar usuarios" });
    }
  },

  user_register: async (req, res) => {
    const { name, lastName, phone, email, password, businessName, businessId, businessType } = req.body;

    try {
      // Verificamos si ya existe un usuario con ese correo electrónico
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "El correo electrónico ya está registrado" });
      }

      // Encriptamos la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Creamos un nuevo usuario
      const newUser = new User({
        name,
        lastName,
        businessName,
        businessId,
        businessType,
        phone,
        email,
        password: hashedPassword,
        role: "user", // Establecemos el rol como "user"
      });

      // Guardamos el nuevo usuario en la base de datos
      await newUser.save();

      res.json({ message: "Registro exitoso como usuario", _id: newUser._id, name: newUser.name, lastName: newUser.lastName });
    } catch (error) {
      console.error("Error en el registro:", error);
      res.status(500).json({ error: "Error en el registro" });
    }
  },

  user_update: async (req, res) => {
    const userId = req.params._id;
    const { businessId, businessType } = req.body;

    try {
      // Actualizamos el usuario con el businessId proporcionado
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { businessId, businessType },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({ message: "Usuario actualizado correctamente", updatedUser });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    // Verificamos si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Buscamos al usuario por su correo electrónico
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Usuario no registrado" });
      }

      // Comparamos la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      // Generamos un token JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        'mi_secreto_secreto',
        { expiresIn: '15m' }
      );

      // Devolvemos una respuesta con el token y los detalles del usuario
      res.json({ message: "Inicio de sesión exitoso", token, _id: user._id, role: user.role, name: user.name, businessName: user.businessName, businessId: user.businessId, businessType: user.businessType });

    } catch (error) {
      console.error("Error al buscar el usuario:", error);
      res.status(500).json({ message: "Error en la autenticación" });
    }
  },

  checkEmail: async (req, res) => {
    const email = req.params.email;

    try {
      // Verificamos si existe un usuario con ese correo electrónico
      const user = await User.findOne({ email });

      if (!user) {
        // Si no se encuentra el usuario, igual enviamos el correo electrónico (opcional)
        console.log("Correo electrónico no encontrado en la base de datos, pero se enviará el correo de restablecimiento de contraseña.");
      }

      // Generamos un token JWT
      const token = jwt.sign({ email }, "mi_secreto_secreto", { expiresIn: "15m" });

      // Intentamos enviar el correo electrónico
      await sendEmail(email, token);

      res.json({
        exists: !!user, // Si el usuario existe, devuelve true
        success: true,
        message: "Correo electrónico enviado correctamente",
        token,
      });

    } catch (error) {
      console.error("Error al enviar el correo electrónico:", error);
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  },
  resetPassword: async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        console.log("Recibiendo datos para resetear contraseña:", email, newPassword);

        // Verificar si el usuario existe
        const user = await User.findOne({ email });

        if (!user) {
            console.log("Usuario no encontrado en la base de datos");
            return res.status(404).json({ message: "No se encontró ningún usuario con este correo electrónico" });
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña del usuario
        user.password = hashedPassword;
        await user.save();

        // Enviar un correo electrónico de confirmación
        const mailOptions = {
            from: process.env.NODEMAILER_USER,
            to: email,
            subject: "Confirmación de cambio de contraseña",
            text: "Tu contraseña ha sido cambiada exitosamente.",
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar el correo electrónico:", error);
            } else {
                console.log("Correo electrónico enviado:", info.response);
            }
        });

        console.log("Contraseña actualizada correctamente");
        res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error("Error al restablecer la contraseña:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
},
sendResetFirebaseEmail: async (req, res) => {
  const { email } = req.body;
  console.log("Iniciando proceso para enviar correo de restablecimiento a:", email);

  try {
    // Verificar si el usuario existe
    const user = await User.findOne({ email });

    if (!user) {
      console.log("Usuario no encontrado en la base de datos");
      return res.status(404).json({ message: "No se encontró ningún usuario con este correo electrónico" });
    }

    console.log("Usuario encontrado en la base de datos:", user);

    // Enviar el correo electrónico de restablecimiento de contraseña utilizando Firebase
    await sendPasswordResetEmail(auth, email);

    console.log("Correo de restablecimiento de Firebase enviado correctamente");
    res.status(200).json({ message: "Correo de restablecimiento enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar el correo de restablecimiento de Firebase:", error.message);
    res.status(500).json({ message: `Error al enviar el correo de restablecimiento: ${error.message}` });
  }
}
};

export default controller; */

//Este controller funciona perfecto enviando cambiando las dos contrseñas nuevas en firebase y mongo db
/* import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { auth, sendPasswordResetEmail } from "../../config/firebase-config.js";

dotenv.config();

// Conectamos a la base de datos MongoDB
mongoose
  .connect(
    "mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project"
  )
  .then(() => console.log("Conectado a la Base de Datos"))
  .catch((error) =>
    console.error("Error al conectar a la Base de Datos:", error)
  );
mongoose.set("strictQuery", true);

import User from "../models/User.model.js";

// Configuramos el transporte para enviar correos electrónicos
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_USER, // Correo electrónico de Gmail
    pass: process.env.NODEMAILER_PASSWORD, // Contraseña de aplicación generada
  },
});

// Función para enviar el correo electrónico de MongoDB
const sendMongoEmail = async (email, token) => {
  try {
    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Solicitud de restablecimiento de contraseña",
      text: `Se ha solicitado un restablecimiento de contraseña. Utiliza el siguiente token para completar el proceso: ${token}`,
      html: `
        <h5>Se ha solicitado un restablecimiento de contraseña.</h5>
        <p>Utiliza el siguiente token para completar el proceso:</p>
        <p><strong>${token}</strong></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo electrónico de MongoDB enviado con éxito");
  } catch (error) {
    console.error("Error al enviar el correo electrónico de MongoDB:", error);
    throw error;
  }
};

// Controlador con las operaciones de usuario
const controller = {
  // Listar todos los usuarios
  users_list: async (req, res) => {
    try {
      const allUsers = await User.find();
      res.json(allUsers);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      res.status(500).json({ error: "Error al buscar usuarios" });
    }
  },

  // Registrar un nuevo usuario
  user_register: async (req, res) => {
    const {
      name,
      lastName,
      phone,
      email,
      password,
      businessName,
      businessId,
      businessType,
    } = req.body;

    try {
      // Verificamos si ya existe un usuario con ese correo electrónico
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está registrado" });
      }

      // Encriptamos la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Creamos un nuevo usuario
      const newUser = new User({
        name,
        lastName,
        businessName,
        businessId,
        businessType,
        phone,
        email,
        password: hashedPassword,
        role: "user", // Establecemos el rol como "user"
      });

      // Guardamos el nuevo usuario en la base de datos
      await newUser.save();

      res.json({
        message: "Registro exitoso como usuario",
        _id: newUser._id,
        name: newUser.name,
        lastName: newUser.lastName,
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      res.status(500).json({ error: "Error en el registro" });
    }
  },

  // Actualizar un usuario
  user_update: async (req, res) => {
    const userId = req.params._id;
    const { businessId, businessType } = req.body;

    try {
      // Actualizamos el usuario con el businessId proporcionado
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { businessId, businessType },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({ message: "Usuario actualizado correctamente", updatedUser });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  },

  // Iniciar sesión
  login: async (req, res) => {
    const { email, password } = req.body;

    // Verificamos si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Buscamos al usuario por su correo electrónico
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Usuario no registrado" });
      }

      // Comparamos la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      // Generamos un token JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        "mi_secreto_secreto",
        { expiresIn: "15m" }
      );

      // Devolvemos una respuesta con el token y los detalles del usuario
      res.json({
        message: "Inicio de sesión exitoso",
        token,
        _id: user._id,
        role: user.role,
        name: user.name,
        businessName: user.businessName,
        businessId: user.businessId,
        businessType: user.businessType,
      });
    } catch (error) {
      console.error("Error al buscar el usuario:", error);
      res.status(500).json({ message: "Error en la autenticación" });
    }
  },

  // Verificar si existe un correo electrónico y enviar el correo de restablecimiento de contraseña de MongoDB
  checkEmail: async (req, res) => {
    const email = req.params.email;

    try {
      // Verificamos si existe un usuario con ese correo electrónico
      const user = await User.findOne({ email });

      if (!user) {
        console.log(
          "Usuario no encontrado en la base de datos, pero se enviará el correo de restablecimiento de contraseña."
        );
      }

      // Generamos un token JWT
      const token = jwt.sign({ email }, "mi_secreto_secreto", {
        expiresIn: "15m",
      });

      // Enviamos el correo electrónico de MongoDB
      await sendMongoEmail(email, token);

      res.json({
        exists: !!user, // Si el usuario existe, devuelve true
        success: true,
        message:
          "Correo electrónico de restablecimiento de MongoDB enviado correctamente",
        token,
      });
    } catch (error) {
      console.error("Error al enviar el correo electrónico de MongoDB:", error);
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  },

  // Restablecer contraseña usando MongoDB
  resetPassword: async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      console.log(
        "Recibiendo datos para resetear contraseña:",
        email,
        newPassword
      );

      // Verificar si el usuario existe
      const user = await User.findOne({ email });

      if (!user) {
        console.log("Usuario no encontrado en la base de datos");
        return res
          .status(404)
          .json({
            message:
              "No se encontró ningún usuario con este correo electrónico",
          });
      }

      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar la contraseña del usuario
      user.password = hashedPassword;
      await user.save();

      // Enviar un correo electrónico de confirmación
      const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: email,
        subject: "Confirmación de cambio de contraseña",
        text: "Tu contraseña ha sido cambiada exitosamente.",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(
            "Error al enviar el correo electrónico de confirmación:",
            error
          );
        } else {
          console.log(
            "Correo electrónico de confirmación enviado:",
            info.response
          );
        }
      });

      console.log("Contraseña actualizada correctamente");
      res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },

  // Enviar correo de restablecimiento de contraseña usando Firebase
  sendResetFirebaseEmail: async (req, res) => {
    const { email } = req.body;
  console.log("Iniciando proceso para enviar correo de restablecimiento a:", email);

  try {
    // Verificar si el usuario existe
    const user = await User.findOne({ email });

    if (!user) {
      console.log("Usuario no encontrado en la base de datos");
      return res.status(404).json({ message: "No se encontró ningún usuario con este correo electrónico" });
    }

    console.log("Usuario encontrado en la base de datos:", user);

    // Enviar el correo electrónico de restablecimiento de contraseña utilizando Firebase
    await sendPasswordResetEmail(auth, email);

    console.log("Correo de restablecimiento de Firebase enviado correctamente");
    res.status(200).json({ success: true,  message: "Correo de restablecimiento de password de firebase enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar el correo de restablecimiento de Firebase:", error.message);
    res.status(500).json({ message: `Error al enviar el correo de restablecimiento: ${error.message}` });
  }
  },
};

export default controller;
 */

/* import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { auth, sendPasswordResetEmail } from "../../config/firebase-config.js";

dotenv.config();  

import * as admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs } from 'fs';

// Ruta al archivo serviceAccountKey.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccountPath = path.join(__dirname, '../../config/serviceAccountKey.json');
console.log("Valor de serviceAccountPath", serviceAccountPath);

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Función asincrónica para cargar las credenciales desde el archivo JSON
async function loadServiceAccount() {
  try {
    const serviceAccountFile = await fs.readFile(serviceAccountPath, 'utf8');
    return JSON.parse(serviceAccountFile);
  } catch (error) {
    console.error('Error al leer el archivo de credenciales:', error);
    throw error;
  }
}

// Inicializar Firebase
async function initializeFirebase() {
  try {
    const serviceAccount = await loadServiceAccount();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      ...firebaseConfig
    });
    console.log('Firebase inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar Firebase:', error.stack);
  }
}

initializeFirebase();

console.log(initializeFirebase)


// Conectamos a la base de datos MongoDB
mongoose
  .connect(
    "mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project"
  )
  .then(() => console.log("Conectado a la Base de Datos"))
  .catch((error) =>
    console.error("Error al conectar a la Base de Datos:", error)
  );
mongoose.set("strictQuery", true);

import User from "../models/User.model.js";

// Configuramos el transporte para enviar correos electrónicos
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_USER, // Correo electrónico de Gmail
    pass: process.env.NODEMAILER_PASSWORD, // Contraseña de aplicación generada
  },
});

// Función para enviar el correo electrónico de MongoDB
const sendMongoEmail = async (email, token) => {
  try {
    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Solicitud de restablecimiento de contraseña",
      text: `Se ha solicitado un restablecimiento de contraseña. Utiliza el siguiente token para completar el proceso: ${token}`,
      html: `
        <h5>Se ha solicitado un restablecimiento de contraseña.</h5>
        <p>Utiliza el siguiente token para completar el proceso:</p>
        <p><strong>${token}</strong></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo electrónico de MongoDB enviado con éxito");
  } catch (error) {
    console.error("Error al enviar el correo electrónico de MongoDB:", error);
    throw error;
  }
};

// Controlador con las operaciones de usuario
const controller = {
  // Listar todos los usuarios
  users_list: async (req, res) => {
    try {
      const allUsers = await User.find();
      res.json(allUsers);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      res.status(500).json({ error: "Error al buscar usuarios" });
    }
  },

  // Registrar un nuevo usuario
  user_register: async (req, res) => {
    const {
      name,
      lastName,
      phone,
      email,
      password,
      businessName,
      businessId,
      businessType,
    } = req.body;

    try {
      // Verificamos si ya existe un usuario con ese correo electrónico
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está registrado" });
      }

      // Encriptamos la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Creamos un nuevo usuario
      const newUser = new User({
        name,
        lastName,
        businessName,
        businessId,
        businessType,
        phone,
        email,
        password: hashedPassword,
        role: "user", // Establecemos el rol como "user"
      });

      // Guardamos el nuevo usuario en la base de datos
      await newUser.save();

      res.json({
        message: "Registro exitoso como usuario",
        _id: newUser._id,
        name: newUser.name,
        lastName: newUser.lastName,
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      res.status(500).json({ error: "Error en el registro" });
    }
  },

  // Actualizar un usuario
  user_update: async (req, res) => {
    const userId = req.params._id;
    const { businessId, businessType } = req.body;

    try {
      // Actualizamos el usuario con el businessId proporcionado
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { businessId, businessType },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({ message: "Usuario actualizado correctamente", updatedUser });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  },

  // Iniciar sesión
  login: async (req, res) => {
    const { email, password } = req.body;

    // Verificamos si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Buscamos al usuario por su correo electrónico
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Usuario no registrado" });
      }

      // Comparamos la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      // Generamos un token JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        "mi_secreto_secreto",
        { expiresIn: "15m" }
      );

      // Devolvemos una respuesta con el token y los detalles del usuario
      res.json({
        message: "Inicio de sesión exitoso",
        token,
        _id: user._id,
        role: user.role,
        name: user.name,
        businessName: user.businessName,
        businessId: user.businessId,
        businessType: user.businessType,
      });
    } catch (error) {
      console.error("Error al buscar el usuario:", error);
      res.status(500).json({ message: "Error en la autenticación" });
    }
  },

  // Verificar si existe un correo electrónico y enviar el correo de restablecimiento de contraseña de MongoDB
  checkEmail: async (req, res) => {
    const email = req.params.email;

    try {
      // Verificamos si existe un usuario con ese correo electrónico
      const user = await User.findOne({ email });

      if (!user) {
        console.log(
          "Usuario no encontrado en la base de datos, pero se enviará el correo de restablecimiento de contraseña."
        );
      }

      // Generamos un token JWT
      const token = jwt.sign({ email }, "mi_secreto_secreto", {
        expiresIn: "15m",
      });

      // Enviamos el correo electrónico de MongoDB
      await sendMongoEmail(email, token);

      res.json({
        exists: !!user, // Si el usuario existe, devuelve true
        success: true,
        message:
          "Correo electrónico de restablecimiento de MongoDB enviado correctamente",
        token,
      });
    } catch (error) {
      console.error("Error al enviar el correo electrónico de MongoDB:", error);
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  },

  // Restablecer contraseña usando MongoDB
  resetPassword: async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      console.log(
        "Recibiendo datos para resetear contraseña:",
        email,
        newPassword
      );

      // Verificar si el usuario existe
      const user = await User.findOne({ email });

      if (!user) {
        console.log("Usuario no encontrado en la base de datos");
        return res
          .status(404)
          .json({
            message:
              "No se encontró ningún usuario con este correo electrónico",
          });
      }

      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar la contraseña del usuario
      user.password = hashedPassword;
      await user.save();

      // Enviar un correo electrónico de confirmación
      const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: email,
        subject: "Confirmación de cambio de contraseña",
        text: "Tu contraseña ha sido cambiada exitosamente.",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(
            "Error al enviar el correo electrónico de confirmación:",
            error
          );
        } else {
          console.log(
            "Correo electrónico de confirmación enviado:",
            info.response
          );
        }
      });

      console.log("Contraseña actualizada correctamente");
      res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },

  // Enviar correo de restablecimiento de contraseña usando Firebase
  sendResetFirebaseEmail: async (req, res) => {
    const { email } = req.body;
  console.log("Iniciando proceso para enviar correo de restablecimiento a:", email);

  try {
    // Verificar si el usuario existe
    const user = await User.findOne({ email });

    if (!user) {
      console.log("Usuario no encontrado en la base de datos");
      return res.status(404).json({ message: "No se encontró ningún usuario con este correo electrónico" });
    }

    console.log("Usuario encontrado en la base de datos:", user);

    // Enviar el correo electrónico de restablecimiento de contraseña utilizando Firebase
    await sendPasswordResetEmail(auth, email);

    console.log("Correo de restablecimiento de Firebase enviado correctamente");
    res.status(200).json({ success: true,  message: "Correo de restablecimiento de password de firebase enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar el correo de restablecimiento de Firebase:", error.message);
    res.status(500).json({ message: `Error al enviar el correo de restablecimiento: ${error.message}` });
  }
  },
};

export default controller; */

//Este codigo funciona como los dioses y cambia las dos contraseñas con un link desde un mail
/* import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { auth, sendPasswordResetEmail } from "../../config/firebase-config.js";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { promises as fs } from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccountPath = path.join(
  __dirname,
  "../../config/serviceAccountKey.json"
);
console.log("Valor de serviceAccountPath:", serviceAccountPath);

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

async function loadServiceAccount() {
  try {
    const serviceAccountFile = await fs.readFile(serviceAccountPath, "utf8");
    const serviceAccount = JSON.parse(serviceAccountFile);
    console.log("Contenido de serviceAccount:", serviceAccount); // Verifica el contenido
    return serviceAccount;
  } catch (error) {
    console.error("Error al leer el archivo de credenciales:", error);
    throw error;
  }
}

async function initializeFirebase() {
  try {
    console.log("Inicializando Firebase...");
    const serviceAccount = await loadServiceAccount();
    console.log("Credenciales de Firebase cargadas:", serviceAccount);
    if (!serviceAccount || !serviceAccount.private_key) {
      throw new Error("Archivo de credenciales de Firebase no válido");
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      ...firebaseConfig,
    });
    console.log("Firebase inicializado correctamente");
  } catch (error) {
    console.error("Error al inicializar Firebase:", error.stack);
  }
}

initializeFirebase();

mongoose
  .connect(
    "mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project"
  )
  .then(() => console.log("Conectado a la Base de Datos"))
  .catch((error) =>
    console.error("Error al conectar a la Base de Datos:", error)
  );
mongoose.set("strictQuery", true);

import User from "../models/User.model.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

const sendMongoEmail = async (email, token) => {
  try {
    const resetLink = `http://localhost:8081/passwordReset?token=${token}&email=${email}`;

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Solicitud de restablecimiento de contraseña",
      html: `
        <h5>Se ha solicitado un restablecimiento de contraseña.</h5>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo electrónico de MongoDB enviado con éxito");
  } catch (error) {
    console.error("Error al enviar el correo electrónico de MongoDB:", error);
    throw error;
  }
};

const controller = {
  users_list: async (req, res) => {
    try {
      const allUsers = await User.find();
      res.json(allUsers);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      res.status(500).json({ error: "Error al buscar usuarios" });
    }
  },

  user_register: async (req, res) => {
    const {
      name,
      lastName,
      phone,
      email,
      password,
      businessName,
      businessId,
      businessType,
    } = req.body;

    try {
      console.log("Datos recibidos para registro:", req.body);
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("El correo electrónico ya está registrado:", email);
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está registrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        lastName,
        businessName,
        businessId,
        businessType,
        phone,
        email,
        password: hashedPassword,
        role: "user",
      });

      await newUser.save();
      console.log("Nuevo usuario registrado:", newUser);

      res.json({
        message: "Registro exitoso como usuario",
        _id: newUser._id,
        name: newUser.name,
        lastName: newUser.lastName,
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      res.status(500).json({ error: "Error en el registro" });
    }
  },

  user_update: async (req, res) => {
    const userId = req.params._id;
    const { businessId, businessType } = req.body;

    try {
      console.log("Datos recibidos para actualizar usuario:", req.body);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { businessId, businessType },
        { new: true }
      );

      if (!updatedUser) {
        console.log("Usuario no encontrado:", userId);
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      console.log("Usuario actualizado correctamente:", updatedUser);
      res.json({ message: "Usuario actualizado correctamente", updatedUser });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Errores de validación:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log("Intentando iniciar sesión con:", email);
      const user = await User.findOne({ email });

      if (!user) {
        console.log("Usuario no registrado:", email);
        return res.status(401).json({ message: "Usuario no registrado" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("Contraseña incorrecta para el usuario:", email);
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        "mi_secreto_secreto",
        { expiresIn: "15m" }
      );

      console.log("Inicio de sesión exitoso para el usuario:", email);
      res.json({
        message: "Inicio de sesión exitoso",
        token,
        _id: user._id,
        role: user.role,
        name: user.name,
        businessName: user.businessName,
        businessId: user.businessId,
        businessType: user.businessType,
      });
    } catch (error) {
      console.error("Error al buscar el usuario:", error);
      res.status(500).json({ message: "Error en la autenticación" });
    }
  },

  checkEmail: async (req, res) => {
    const email = req.params.email;

    try {
      console.log("Verificando email:", email);
      const user = await User.findOne({ email });

      if (!user) {
        console.log(
          "Usuario no encontrado en la base de datos, pero se enviará el correo de restablecimiento de contraseña."
        );
      }

      const token = jwt.sign({ email }, "mi_secreto_secreto", {
        expiresIn: "15m",
      });

      await sendMongoEmail(email, token);
      console.log("Correo electrónico de restablecimiento enviado a:", email);

      res.json({
        exists: !!user,
        success: true,
        message:
          "Correo electrónico de restablecimiento de MongoDB enviado correctamente",
        token,
      });
    } catch (error) {
      console.error("Error al enviar el correo electrónico de MongoDB:", error);
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  },
  resetPassword: async (req, res) => {
    const { email, newPassword } = req.body;
    try {
      console.log(
        "Recibiendo datos para resetear contraseña:",
        email,
        newPassword
      );

      // Buscar usuario en la base de datos por email
      const user = await User.findOne({ email });

      if (!user) {
        console.log("Usuario no encontrado en la base de datos");
        return res.status(404).json({
          message: "No se encontró ningún usuario con este correo electrónico",
        });
      }

      // Hashing de la nueva contraseña y guardado en MongoDB
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      console.log("Contraseña actualizada correctamente en MongoDB");

      // Envío de correo de confirmación
      const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: email,
        subject: "Confirmación de cambio de contraseña",
        text: "Tu contraseña ha sido cambiada exitosamente.",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(
            "Error al enviar el correo electrónico de confirmación:",
            error
          );
        } else {
          console.log(
            "Correo electrónico de confirmación enviado:",
            info.response
          );
        }
      });

      // Actualizar la contraseña en Firebase
      try {
        const firebaseUser = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(firebaseUser.uid, {
          password: newPassword,
        });
        console.log("Contraseña actualizada correctamente en Firebase");
      } catch (firebaseError) {
        console.error(
          "Error al actualizar la contraseña en Firebase:",
          firebaseError
        );
        return res
          .status(500)
          .json({ message: "Error al actualizar la contraseña en Firebase" });
      }

      res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },
};

export default controller; */

//codigo de chat GPT funcionando perfecto pero no devuelve emails con mayusculas
/* import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import { auth, sendPasswordResetEmail, admin } from "../../config/firebase.js"; // Importamos desde firebase.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js"; // Asegúrate de ajustar la ruta según tu estructura

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

// Método para enviar correo electrónico desde MongoDB
const sendMongoEmail = async (email, token) => {
  try {
    const resetLink = `http://localhost:8081/passwordReset?token=${token}&email=${email}`;

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Solicitud de restablecimiento de contraseña",
      html: `
        <h5>Se ha solicitado un restablecimiento de contraseña.</h5>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo electrónico de MongoDB enviado con éxito");
  } catch (error) {
    console.error("Error al enviar el correo electrónico de MongoDB:", error);
    throw error;
  }
};

const controller = {
  users_list: async (req, res) => {
    try {
      const allUsers = await User.find();
      res.json(allUsers);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      res.status(500).json({ error: "Error al buscar usuarios" });
    }
  },

  user_register: async (req, res) => {
    const {
      name,
      lastName,
      phone,
      email,
      password,
      businessName,
      businessId,
      businessType,
    } = req.body;

    try {
      console.log("Datos recibidos para registro:", req.body);
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("El correo electrónico ya está registrado:", email);
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está registrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        lastName,
        businessName,
        businessId,
        businessType,
        phone,
        email,
        password: hashedPassword,
        role: "user",
      });

      await newUser.save();
      console.log("Nuevo usuario registrado:", newUser);

      res.json({
        message: "Registro exitoso como usuario",
        _id: newUser._id,
        name: newUser.name,
        lastName: newUser.lastName,
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      res.status(500).json({ error: "Error en el registro" });
    }
  },

  user_update: async (req, res) => {
    const userId = req.params._id;
    const { businessId, businessType } = req.body;

    try {
      console.log("Datos recibidos para actualizar usuario:", req.body);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { businessId, businessType },
        { new: true }
      );

      if (!updatedUser) {
        console.log("Usuario no encontrado:", userId);
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      console.log("Usuario actualizado correctamente:", updatedUser);
      res.json({ message: "Usuario actualizado correctamente", updatedUser });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Errores de validación:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log("Intentando iniciar sesión con:", email);
      const user = await User.findOne({ email });

      if (!user) {
        console.log("Usuario no registrado:", email);
        return res.status(401).json({ message: "Usuario no registrado" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("Contraseña incorrecta para el usuario:", email);
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        "mi_secreto_secreto",
        { expiresIn: "15m" }
      );

      console.log("Inicio de sesión exitoso para el usuario:", email);
      res.json({
        message: "Inicio de sesión exitoso",
        token,
        _id: user._id,
        role: user.role,
        name: user.name,
        businessName: user.businessName,
        businessId: user.businessId,
        businessType: user.businessType,
      });
    } catch (error) {
      console.error("Error al buscar el usuario:", error);
      res.status(500).json({ message: "Error en la autenticación" });
    }
  },

  checkEmail: async (req, res) => {
    const email = req.params.email;

    try {
      console.log("Verificando email:", email);
      const user = await User.findOne({ email });

      if (!user) {
        console.log(
          "Usuario no encontrado en la base de datos, pero se enviará el correo de restablecimiento de contraseña."
        );
      }

      const token = jwt.sign({ email }, "mi_secreto_secreto", {
        expiresIn: "15m",
      });

      await sendMongoEmail(email, token);
      console.log("Correo electrónico de restablecimiento enviado a:", email);

      res.json({
        exists: !!user,
        success: true,
        message:
          "Correo electrónico de restablecimiento de MongoDB enviado correctamente",
        token,
      });
    } catch (error) {
      console.error("Error al enviar el correo electrónico de MongoDB:", error);
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  },

  resetPassword: async (req, res) => {
    const { email, newPassword } = req.body;
    try {
      console.log(
        "Recibiendo datos para resetear contraseña:",
        email,
        newPassword
      );

      // Buscar usuario en la base de datos por email
      const user = await User.findOne({ email });

      if (!user) {
        console.log("Usuario no encontrado en la base de datos");
        return res.status(404).json({
          message: "No se encontró ningún usuario con este correo electrónico",
        });
      }

      // Hashing de la nueva contraseña y guardado en MongoDB
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      console.log("Contraseña actualizada correctamente en MongoDB");

      // Envío de correo de confirmación
      const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: email,
        subject: "Confirmación de cambio de contraseña",
        text: "Tu contraseña ha sido cambiada exitosamente.",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(
            "Error al enviar el correo electrónico de confirmación:",
            error
          );
        } else {
          console.log(
            "Correo electrónico de confirmación enviado:",
            info.response
          );
        }
      });

      // Actualizar la contraseña en Firebase
      try {
        const firebaseUser = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(firebaseUser.uid, {
          password: newPassword,
        });
        console.log("Contraseña actualizada correctamente en Firebase");
      } catch (firebaseError) {
        console.error(
          "Error al actualizar la contraseña en Firebase:",
          firebaseError
        );
        return res
          .status(500)
          .json({ message: "Error al actualizar la contraseña en Firebase" });
      }

      res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },
};

export default controller; */

import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import { auth, sendPasswordResetEmail, admin } from "../../config/firebase.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

// Método para enviar correo electrónico desde MongoDB
const sendMongoEmail = async (email, token) => {
  try {
    const resetLink = `http://localhost:8081/passwordReset?token=${token}&email=${email}`;

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Solicitud de restablecimiento de contraseña",
      html: `
        <h5>Se ha solicitado un restablecimiento de contraseña.</h5>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo electrónico de MongoDB enviado con éxito");
  } catch (error) {
    console.error("Error al enviar el correo electrónico de MongoDB:", error);
    throw error;
  }
};

const controller = {
  user_detail: (req, res) => {
    const businessId = req.params._id; // Obtengo el ID del negocio desde los parámetros de la solicitud
    User.findById(businessId) // Busco el usuario por su ID
      .then((oneUser) => {
        if (!oneUser) {
          // Manejo el caso si el usuario no se encuentra
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(oneUser); // Envío los datos del Usuario encontrado como respuesta
      })
      .catch((error) => {
        console.error("Error al buscar el usuario: ", error);
        res.status(500).json({ error: "Error al buscar el usuario" });
      });
  },
  users_list: async (req, res) => {
    try {
      const allUsers = await User.find();
      res.json(allUsers);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      res.status(500).json({ error: "Error al buscar usuarios" });
    }
  },

  user_register: async (req, res) => {
    const {
      name,
      lastName,
      phone,
      email,
      password,
      businessName,
      businessId,
      businessType,
    } = req.body;

    try {
      const normalizedEmail = email.toLowerCase();

      console.log("Datos recibidos para registro:", req.body);

      let existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        console.log(
          "El correo electrónico ya está registrado:",
          normalizedEmail
        );
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está registrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        lastName,
        businessName,
        businessId,
        businessType,
        phone,
        email: normalizedEmail,
        originalEmail: email,
        password: hashedPassword,
        role: "user",
      });

      await newUser.save();
      console.log("Nuevo usuario registrado:", newUser);

      res.json({
        message: "Registro exitoso como usuario",
        _id: newUser._id,
        name: newUser.name,
        lastName: newUser.lastName,
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      res.status(500).json({ error: "Error en el registro" });
    }
  },

  //user_update: async (req, res) => {
  businessId_and_businessType_update: async (req, res) => {
    const userId = req.params._id;
    const { businessId, businessType } = req.body;

    try {
      console.log("Datos recibidos para actualizar usuario:", req.body);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { businessId, businessType },
        { new: true }
      );

      if (!updatedUser) {
        console.log("Usuario no encontrado:", userId);
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      console.log("Usuario actualizado correctamente:", updatedUser);
      res.json({ message: "Usuario actualizado correctamente", updatedUser });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  },
  /* user_update: async (req, res) => {
    const userId = req.params._id;
    const { name, lastName, phone, businessType, businessName } = req.body;

    try {
      console.log("Datos recibidos para actualizar usuario:", req.body);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          name: name,
          lastName: lastName,
          phone: phone,
          businessType: businessType,
          businessName: businessName,
        },
        { new: true }
      );

      if (!updatedUser) {
        console.log("Usuario no encontrado:", userId);
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      console.log("Usuario actualizado correctamente:", updatedUser);
      res.json({ message: "Usuario actualizado correctamente", updatedUser });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  }, */
  user_update: async (req, res) => {
    const userId = req.params._id;
    const { name, lastName, phone, businessType, businessName } = req.body;

    try {
      console.log("Datos recibidos para actualizar usuario:", req.body);

      const updateData = {};
      if (name) updateData.name = name;
      if (lastName) updateData.lastName = lastName;
      if (phone) updateData.phone = phone;
      if (businessType) updateData.businessType = businessType;
      if (businessName) updateData.businessName = businessName;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      );

      if (!updatedUser) {
        console.log("Usuario no encontrado:", userId);
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      console.log("Usuario actualizado correctamente:", updatedUser);
      res.json({ message: "Usuario actualizado correctamente", updatedUser });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Errores de validación:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const normalizedEmail = email.toLowerCase();

      console.log("Intentando iniciar sesión con:", normalizedEmail);
      const user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        console.log("Usuario no registrado:", normalizedEmail);
        return res.status(401).json({ message: "Usuario no registrado" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("Contraseña incorrecta para el usuario:", normalizedEmail);
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        "mi_secreto_secreto",
        { expiresIn: "15m" }
      );

      console.log("Inicio de sesión exitoso para el usuario:", normalizedEmail);
      res.json({
        message: "Inicio de sesión exitoso",
        token,
        _id: user._id,
        role: user.role,
        name: user.name,
        businessName: user.businessName,
        businessId: user.businessId,
        businessType: user.businessType,
        originalEmail: user.originalEmail, // Devolver el email original si es necesario
      });
    } catch (error) {
      console.error("Error al buscar el usuario:", error);
      res.status(500).json({ message: "Error en la autenticación" });
    }
  },

  checkEmail: async (req, res) => {
    const email = req.params.email.toLowerCase();

    try {
      console.log("Verificando email:", email);
      const user = await User.findOne({ email });

      if (!user) {
        console.log(
          "Usuario no encontrado en la base de datos, pero se enviará el correo de restablecimiento de contraseña."
        );
      }

      const token = jwt.sign({ email }, "mi_secreto_secreto", {
        expiresIn: "15m",
      });

      await sendMongoEmail(email, token);
      console.log("Correo electrónico de restablecimiento enviado a:", email);

      res.json({
        exists: !!user,
        success: true,
        message:
          "Correo electrónico de restablecimiento de MongoDB enviado correctamente",
        token,
      });
    } catch (error) {
      console.error("Error al enviar el correo electrónico de MongoDB:", error);
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  },
  resetPassword: async (req, res) => {
    const { email, newPassword } = req.body;
    const normalizedEmail = email.toLowerCase();

    try {
      console.log(
        "Recibiendo datos para resetear contraseña:",
        normalizedEmail,
        newPassword
      );

      // Buscar usuario en la base de datos por email
      const user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        console.log("Usuario no encontrado en la base de datos");
        return res.status(404).json({
          message: "No se encontró ningún usuario con este correo electrónico",
        });
      }

      // Hashing de la nueva contraseña y guardado en MongoDB
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      console.log("Contraseña actualizada correctamente en MongoDB");

      // Envío de correo de confirmación
      const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: email,
        subject: "Confirmación de cambio de contraseña",
        text: "Tu contraseña ha sido cambiada exitosamente.",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(
            "Error al enviar el correo electrónico de confirmación:",
            error
          );
        } else {
          console.log(
            "Correo electrónico de confirmación enviado:",
            info.response
          );
        }
      });

      // Actualizar la contraseña en Firebase
      try {
        const firebaseUser = await admin.auth().getUserByEmail(normalizedEmail);
        await admin.auth().updateUser(firebaseUser.uid, {
          password: newPassword,
        });
        console.log("Contraseña actualizada correctamente en Firebase");
      } catch (firebaseError) {
        console.error(
          "Error al actualizar la contraseña en Firebase:",
          firebaseError
        );
        return res
          .status(500)
          .json({ message: "Error al actualizar la contraseña en Firebase" });
      }

      res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },
};

export default controller;
