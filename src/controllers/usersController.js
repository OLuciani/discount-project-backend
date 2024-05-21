/* import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult} from "express-validator";

// Establezco la conexión a la base de datos con la URL almacenada en una variable de entorno
mongoose
  .connect("mongodb+srv://lucianioscar1:shushonga65catriel1965@cluster-discounts-proje.hqzkjw6.mongodb.net/discounts-project")
  .then(() => console.log("Conectado a Base de Datos"));
// Establezco una opción adicional para consultas estrictas
mongoose.set("strictQuery", true);

import User from "../models/User.model.js";

console.log(User);

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
    const { email, password, isAdmin } = req.body;
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
            email,
            password: hashedPassword,
            isAdmin: isAdmin || false, // Marca al usuario como usuario normal
          });
  
          // Guarda al usuario en la base de datos
          newUser.save()
            .then((user) => {
              // Aquí envío una respuesta de éxito en el registro. También podría redireccionar al usuario a otra página
              res.json({ message: "Registro exitoso como usuario" });
            })
            .catch((error) => {
              // Aquí manejas los errores en caso de que no se pueda guardar el usuario en la base de datos
              res.status(500).json({ error: "Error en el registro" });
            });
        });
      });
    
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
        const token = jwt.sign({ userId: user._id, email: user.email }, 'mi_secreto_secreto', { expiresIn: '15m' });

        // Enviar una respuesta con el token, el rol del usuario y el id del usuario.
        res.json({ message: "Inicio de sesión exitoso", token, _id: user._id, role: user.isAdmin ? 'admin' : 'user' });
    } catch (error) {
        console.error("Error al buscar el usuario:", error);
        res.status(500).json({ message: "Error en la autenticación" });
    }
  },
  checkEmail: async (req, res) => {
      const email = req.params.email;
    
      try {
        const user = await User.findOne({ email });
        if (user) {
          // Generar un token único utilizando JWT
          const token = jwt.sign({ email }, 'tu_secreto', { expiresIn: '15m' }); // Firma con un secreto y expiración de 15 minutos
    
          // Devolver el token junto con la respuesta
          res.json({ exists: true, success: true, message: 'Correo electrónico encontrado', token });
        } else {
          res.json({ exists: false, success: false, message: 'Correo electrónico no encontrado' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
      }
    }
  
};

export default controller; */



import mongoose from "mongoose";
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
    const { email, password/* , isAdmin  */} = req.body;
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
            email,
            password: hashedPassword,
            //isAdmin: isAdmin || false, // Marca al usuario como usuario normal
            role: "user", // Marca al usuario como usuario normal
          });
  
          // Guarda al usuario en la base de datos
          newUser.save()
            .then((user) => {
              // Aquí envío una respuesta de éxito en el registro. También podría redireccionar al usuario a otra página
              res.json({ message: "Registro exitoso como usuario" });
            })
            .catch((error) => {
              // Aquí manejas los errores en caso de que no se pueda guardar el usuario en la base de datos
              res.status(500).json({ error: "Error en el registro" });
            });
        });
      });
    
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
        res.json({ message: "Inicio de sesión exitoso", token, _id: user._id, role: user.role });

    } catch (error) {
        console.error("Error al buscar el usuario:", error);
        res.status(500).json({ message: "Error en la autenticación" });
    }
  },
  /* checkEmail: async (req, res) => {
    const email = req.params.email;
  
    try {
      const user = await User.findOne({ email });
      if (user) {
        const token = jwt.sign({ email }, "tu_secreto", { expiresIn: "15m" });
  
        // Intenta enviar el correo electrónico
        try {
          await sendEmail(email, token);
          res.json({
            exists: true,
            success: true,
            message: "Correo electrónico encontrado",
            token,
          });
        } catch (error) {
          console.error("Error al enviar el correo electrónico:", error);
          res.status(500).json({ success: false, message: "Error al enviar el correo electrónico" });
        }
      } else {
        res.json({
          exists: false,
          success: false,
          message: "Correo electrónico no encontrado",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  } */
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

export default controller;