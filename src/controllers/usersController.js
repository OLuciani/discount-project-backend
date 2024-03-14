import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    const { email, password, es_admin } = req.body;
  
   
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
            es_admin: es_admin || false, // Marca al usuario como usuario normal
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
login: (req, res) => {
  console.log("Solicitud de inicio de sesión recibida");
  console.log("Datos de la solicitud:", req.body);

  const { email, password } = req.body;

  console.log("Email recibido:", email);
  console.log("Contraseña recibida:", password);

  User.findOne({ email })
      .then((user) => {
          console.log("Usuario encontrado:", user);
      
          if (!user) {
              console.log("Usuario no encontrado");
              return res.status(401).json({ message: "Usuario no registrado" });
          }

          // Verificar la contraseña
          bcrypt.compare(password, user.password, (err, result) => {
              if (err) {
                  console.error(err);
                  return res.status(500).json({ message: "Error en la autenticación" });
              }
  
              if (!result) {
                  return res.status(401).json({ message: "Contraseña incorrecta" });
              }
  
              // Si las contraseñas coinciden, generar un token
              const token = jwt.sign({ userId: user._id, email: user.email }, 'mi_secreto_secreto', { expiresIn: '1h' });

              // Enviar una respuesta con el token y el rol del usuario
              res.json({ message: "Inicio de sesión exitoso", token, role: user.es_admin ? 'admin' : 'user' });
          });
      })
      .catch((error) => {
          console.error("Error al buscar el usuario:", error);
          res.status(500).json({ message: "Error en la autenticación" });
      });
}

  

};

export default controller;