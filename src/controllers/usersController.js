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

// Método para enviar correo electrónico desde el backend a usuarios para cambiar password desde  aplicación web.
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

// Método para enviar correo electrónico para cambiar password desde el backend a usuarios desde aplicación movil.
/* const sendMobileMongoEmail = async (email, token) => {
  try {
    const resetLink = `exp://192.168.100.2:8081/--/PasswordResetForm?token=${token}&email=${email}`;

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Solicitud de restablecimiento de contraseña",
      html: `
        <h5>Se ha solicitado un restablecimiento de contraseña.</h5>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <p><a href="${resetLink}" style="color: blue; text-decoration: underline;">Restablecer contraseña</a></p>
        <p>Si tienes problemas con el enlace, por favor contacta con el soporte técnico.</p>
      `,
    };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error al enviar correo electrónico:', error);
  }
}; */

const sendMobileMongoEmail = async (email, token) => {
  try {
    // Usa http o https en lugar de exp:// para el enlace
    const resetLink = `http://192.168.100.2:8081/--/PasswordResetForm?token=${token}&email=${email}`;

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

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error al enviar correo electrónico:', error);
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
      return res.status(400).json({ code: "VALIDATION_ERROR", message: "Errores de validación", errors: errors.array() });
    }
  
    try {
      const normalizedEmail = email.toLowerCase();
  
      console.log("Intentando iniciar sesión con:", normalizedEmail);
  
      const user = await User.findOne({ email: normalizedEmail });
  
      if (!user) {
        console.log("Usuario no registrado:", normalizedEmail);
        return res.status(401).json({ code: "USER_NOT_FOUND", message: "Usuario no registrado" });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("Contraseña incorrecta para el usuario:", normalizedEmail);
        return res.status(401).json({ code: "INVALID_PASSWORD", message: "Contraseña incorrecta" });
      }
  
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        "mi_secreto_secreto",
        { expiresIn: "15m" }
      );
  
      console.log("Inicio de sesión exitoso para el usuario:", normalizedEmail);
  
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 minutos
      });
  
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
      res.status(500).json({ code: "AUTHENTICATION_ERROR", message: "Error en la autenticación" });
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
  checkEmailFromMobile: async (req, res) => {
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

      await sendMobileMongoEmail(email, token);
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
