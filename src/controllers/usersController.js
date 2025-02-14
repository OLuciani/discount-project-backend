import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import { auth, sendPasswordResetEmail, admin } from "../../config/firebase.js";
//import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Business from "../models/Business.model.js";

const compareAsync = promisify(bcrypt.compare);

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

// Función para enviar correo a administradores
const notifyAdminsOfNewBusiness = async (user) => {
  try {
    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: process.env.ADMIN_EMAILS, // Un listado de correos de administradores
      subject: "Nuevo administrador de negocio registrado",
      html: `
        <h5>Nuevo administrador de negocio registrado</h5>
        <p>Un nuevo negocio ha solicitado registro en la aplicación:</p>
        <ul>
          <li>Nombre del nuevo usuario: ${user.name} ${user.lastName}</li>
          <li>Email: ${user.originalEmail}</li>
          <li>Nombre del negocio: ${user.businessName}</li>
          <li>Tipo de negocio: ${user.businessType}</li>
        </ul>
        <p>Puedes revisar el documento de inscripción del negocio aquí: ${user.pdfBusinessRegistration}"</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo de notificación enviado a los administradores");
  } catch (error) {
    console.error("Error al enviar correo a los administradores:", error);
  }
};

const sendConfirmEmail = async (email, token) => {
  try {
    //const resetLink = `http://localhost:8081/register?token=${token}&email=${email}`;
    const resetLink = `${process.env.FRONTEND_WEB_URL}/register?token=${token}&email=${email}`;

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Solicitud de confirmación de correo electrónico",
      html: `
        <h5>Se ha solicitado la confirmación de correo electrónico para crear cuenta en la aplicación.</h5>
        <p>Haz clic en el siguiente enlace para crear tu cuenta en la aplicación:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      "Correo electrónico para confirmación de Email enviado con éxito"
    );
  } catch (error) {
    console.error(
      "Error al enviar el correo electrónico de Confirmación de Email:",
      error
    );
    throw error;
  }
};

const sendInvitationBusinessEmployeeUserEmail = async (email, token, businessId, businessName) => {
  console.log("Valor de businessName en sendInvitationBusinessEmployeeUserEmail: ", businessName);
  try {
    //const resetLink = `http://localhost:8081/createBusinessEmployeeUser?token=${token}&email=${email}&businessId=${businessId}&businessName=${businessName}`;
    const resetLink = `${process.env.FRONTEND_WEB_URL}/createBusinessEmployeeUser?token=${token}&email=${email}&businessId=${businessId}&businessName=${businessName}`;

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: `Invitación p/crear cuenta asociada al negocio ${businessName}`,
      html: `
        <h5>Has sido invitado a unirte a la cuenta del negocio ${businessName} en la aplicación Comé x menos.</h5>
        <p>Haz clic en el siguiente enlace para crear tu cuenta en la aplicación:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      "Correo electrónico para crear usuario con acceso a Scanner enviado con éxito"
    );
  } catch (error) {
    console.error(
      "Error al enviar el correo electrónico para crear usuario con acceso a Scanner:",
      error
    );
    throw error;
  }
};


const sendInvitationExtraBusinessAdminUserEmail = async (email, token, businessId, businessName) => {
  try {
    //const resetLink = `http://localhost:8081/createExtraBusinessAdminUser?token=${token}&email=${email}&businessId=${businessId}`;
    const resetLink = `${process.env.FRONTEND_WEB_URL}/createExtraBusinessAdminUser?token=${token}&email=${email}&businessId=${businessId}`;

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Invitación para crear cuenta como Usuario Administrador",
      html: `
        <h5>Has sido invitado a crear cuenta como Usuario administrador de la cuenta del negocio ${businessName}.</h5>
        <p>Haz clic en el siguiente enlace para crear tu cuenta en la aplicación:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      "Correo electrónico para crear usuario administrador de cuenta de negocio enviado con éxito"
    );
  } catch (error) {
    console.error(
      "Error al enviar el correo electrónico para crear usuario administrador de cuenta de negocio:",
      error
    );
    throw error;
  }
};


// Método para enviar correo electrónico desde el backend a usuarios para cambiar password desde aplicación web.
const sendMongoEmail = async (email, token) => {
  try {
    //const resetLink = `http://localhost:8081/passwordReset?token=${token}&email=${email}`;
    const resetLink = `${process.env.FRONTEND_WEB_URL}/passwordReset?token=${token}&email=${email}`;

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
const sendMobileMongoEmail = async (email, token) => {
  try {
    const resetLink = `navegacion-react-native://PasswordResetForm?token=${token}&email=${email}`;

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Solicitud de restablecimiento de contraseña",
      html: `
        <h5>Se ha solicitado un restablecimiento de contraseña.</h5>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <p><a href="${resetLink}" style="color: blue; text-decoration: underline;">${resetLink}</a></p>
        <p>Si tienes problemas con el enlace, por favor contacta con el soporte técnico.</p>
      `,
    };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error al enviar correo electrónico:", error);
  }
};

//Por el momento no estoy utilizando sendMobileMongoEmail ya que no estoy utilizando la ruta y contoller checkEmailFromMobile.
/* const sendMobileMongoEmail = async (email, token) => {
  try {
    // Usa http o https en lugar de exp:// para el enlace
    const resetLink = `navegacion-react-native://PasswordResetForm?token=${token}&email=${email}`;


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
}; */

const controller = {
  confirm_email: async (req, res) => {
    //req.params.email.toLowerCase();
    const { email } = req.body;

    try {
      const normalizedEmail = email.toLowerCase();

      let existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        console.log(
          "El correo electrónico ya está registrado:",
          normalizedEmail
        );
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está registrado" });
      } else {
        const confirmEmailToken = jwt.sign(
          { email: email },
          process.env.CONFIRM_EMAIL_SECRET,
          {
            expiresIn: "15m",
          }
        );

        await sendConfirmEmail(email, confirmEmailToken);
        console.log(
          "Correo electrónico para confirmación de email para iniciar cuenta enviado a:",
          email
        );

        res.json({
          //exists: !!user,
          success: true,
          message:
            "Correo electrónico con enlace para crear cuenta enviado correctamente",
          token: confirmEmailToken,
        });
      }
    } catch (error) {
      console.error(
        "Error al procesar la solicitud de chequeo de email para crear cuenta:",
        error
      );
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  }, 
  user_register: async (req, res) => {
    const { name, lastName, phone, email, password, businessName, businessId } = req.body;
    
    try {
      const normalizedEmail = email.toLowerCase();
  
      // Verificar si el correo ya existe en MongoDB
      let existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ error: "El correo electrónico ya está registrado" });
      }
  
      // Verificar si el correo ya existe en Firebase
      try {
        await admin.auth().getUserByEmail(normalizedEmail);
        return res.status(400).json({ error: "El correo electrónico ya está registrado en Firebase" });
      } catch (firebaseError) {
        if (firebaseError.code !== "auth/user-not-found") {
          console.error("Error al verificar usuario en Firebase:", firebaseError);
          return res.status(500).json({ error: "Error al verificar usuario en Firebase" });
        }
      }
  
      // Crear usuario en Firebase
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().createUser({
          email: normalizedEmail,
          password,
        });
        console.log("Usuario creado en Firebase:", firebaseUser.uid);
      } catch (error) {
        console.error("Error al crear usuario en Firebase:", error);
        if (error.code === "auth/weak-password") {
          return res.status(400).json({ error: "La contraseña es demasiado débil" });
        }
        if (error.code === "auth/invalid-email") {
          return res.status(400).json({ error: "El correo electrónico es inválido" });
        }
        return res.status(500).json({ error: "Error al crear usuario en Firebase" });
      }
  
      // Crear usuario en MongoDB
      const hashedPassword = await bcrypt.hash(password, 10);
      const roleBusinessDirector = process.env.ROLE_BUSINESS_DIRECTOR;
  
      const newUser = new User({
        name,
        lastName,
        businessId,
        businessName,
        phone,
        email: normalizedEmail,
        originalEmail: email,
        password: hashedPassword,
        role: roleBusinessDirector,
        firebaseUID: firebaseUser.uid,
      });
  
      await newUser.save();
      console.log("Nuevo usuario registrado en MongoDB:", newUser);
  
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
  user_register_mobile: async (req, res) => {
    const {
      email,
      password,
    } = req.body;

    try {
      const normalizedEmail = email.toLowerCase();

      console.log("Datos recibidos para registro de usuario de la app móvil:", req.body);

      // Verificar si el correo ya existe en MongoDB
      let existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ error: "El correo electrónico ya está registrado" });
      }
  
      // Verificar si el correo ya existe en Firebase
      try {
        await admin.auth().getUserByEmail(normalizedEmail);
        return res.status(400).json({ error: "El correo electrónico ya está registrado en Firebase" });
      } catch (firebaseError) {
        if (firebaseError.code !== "auth/user-not-found") {
          console.error("Error al verificar usuario en Firebase:", firebaseError);
          return res.status(500).json({ error: "Error al verificar usuario en Firebase" });
        }
      }
  
      // Crear usuario en Firebase
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().createUser({
          email: normalizedEmail,
          password,
        });
        console.log("Usuario creado en Firebase:", firebaseUser.uid);
      } catch (error) {
        console.error("Error al crear usuario en Firebase:", error);
        if (error.code === "auth/weak-password") {
          return res.status(400).json({ error: "La contraseña es demasiado débil" });
        }
        if (error.code === "auth/invalid-email") {
          return res.status(400).json({ error: "El correo electrónico es inválido" });
        }
        return res.status(500).json({ error: "Error al crear usuario en Firebase" });
      }

      // Crear usuario en MongoDB
      const hashedPassword = await bcrypt.hash(password, 10);

      const roleMobileCustomer = process.env.ROLE_MOBILE_CUSTOMER;

      const newUser = new User({
        email: normalizedEmail,
        originalEmail: email,
        password: hashedPassword,
        role: roleMobileCustomer,
        status: "active",
        firebaseUID: firebaseUser.uid,
        
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
  user_detail: (req, res) => {
    const { userId } = req.user; // Extraigo userId del objeto req.user (del token de la cookie).
    User.findById(userId) // Busco el usuario por su ID
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
  all_users_list: async (req, res) => {
    try {
      const roleBusinessDirector = process.env.ROLE_BUSINESS_DIRECTOR; 
      const roleBusinessManager = process.env.ROLE_BUSINESS_MANAGER;
      const roleBusinessEmployee = process.env.ROLE_BUSINESS_EMPLOYEE;
      const roleMobileCustomer = process.env.ROLE_MOBILE_CUSTOMER;
  
      // Buscar usuarios 
      const users = await User.find({
        //status: "active",
        role: { $in: [roleBusinessDirector, roleBusinessManager, roleBusinessEmployee, roleMobileCustomer] }
      });
  
      // Formatear la respuesta de usuarios con el rol adecuado
      const activeUsers = users.map((user) => {
        let roleType = "";
  
        if (user.role === roleBusinessDirector) {
          roleType = "businessDirector";
        } else if (user.role === roleBusinessManager) {
          roleType = "businessManager";
        } else if (user.role === roleBusinessEmployee) {
          roleType = "businessEmployee";
        } else if (user.role === roleMobileCustomer) {
          roleType = "mobileCustomer";
        }
  
        return {
          ...user._doc,  // _doc contiene los datos del usuario
          role: roleType,
        };
      });
  
      // Enviar los usuarios al frontend
      res.json(activeUsers);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  },   
  businessId_and_businessType_update: async (req, res) => {
    const userId = req.params._id;
    const { businessId, businessType, pdfBusinessRegistration } = req.body;

    try {
      console.log("Datos recibidos para actualizar usuario:", req.body);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { businessId, businessType, pdfBusinessRegistration },
        { new: true }
      );

      if (!updatedUser) {
        console.log("Usuario no encontrado:", userId);
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      console.log("Usuario actualizado correctamente:", updatedUser);
      res.json({ message: "Usuario actualizado correctamente", updatedUser });

      // Busca y trae datos del usuario en la base de datos excluyendo password, userId y businessId.
      const user = await User.findById(userId);
      if (user) {
        //Se envía email a la administración de la app Comé x menos para notificando que se creó una cuenta de un nuevo Negocio (se crearon los documentos user y business en Mongo DB Atlas) para revisar si cumple con los requisitos y en caso de ser asi se le adjudica el rol para poder utilizar todas las funciones de la app.
        await notifyAdminsOfNewBusiness(user);
        console.log(
          "Correo electrónico para el registro de un nuevo Usuario/Negocio enviado a la administración de la aplicación Comé x menos"
        );
      }
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  },
  //este controller tiene configurado para que no deje modificar a un usuario con subRole "visit_user"
  user_update: async (req, res) => {
    const { userId, subRole } = req.user; // Extraigo userId del objeto req.user (del token de la cookie).
 
    console.log("Valor de userId en user_update: ", userId); 

    const subRole_user = process.env.SUBROLE_VISIT_USER;

    console.log("Valor de subRole en el controller user_update: ", subRole);

    console.log("Valor de subRole_user en el controller user_update:", subRole_user);

    if (subRole !== subRole_user) {

      const { name, lastName, phone } = req.body;
  
      try {
        console.log("Datos recibidos para actualizar usuario:", req.body);
  
        const updateData = {};
        if (name) updateData.name = name;
        if (lastName) updateData.lastName = lastName;
        if (phone) updateData.phone = phone;
        //if (businessType) updateData.businessType = businessType;
        //if (businessName) updateData.businessName = businessName;
  
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
          new: true,
        });
  
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
    } else {
      // Respuesta cuando el subRole es "visit_user"
      return res.status(403).json({
        error: "Acción no permitida: los usuarios con el subRole 'visit_user' no pueden modificar su cuenta."
      });
    } 
  },
  login: async (req, res) => {
    const { email, password, isMobileUser, secret_key } = req.body;
  
    console.log("Valor de isMobileUser: ", isMobileUser);
    console.log("Valor de secret_key: ", secret_key);
  
    let showToken = false;
  
    const app_mobile_secret = process.env.APP_MOBILE_SECRET;
  
    if (secret_key === app_mobile_secret && isMobileUser) {
      showToken = true;
    }
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Errores de validación:", errors.array());
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Errores de validación",
        errors: errors.array(),
      });
    }
  
    try {
      const normalizedEmail = email.toLowerCase();
  
      console.log("Intentando iniciar sesión con:", normalizedEmail);
  
      // Verificar credenciales en Firebase
      const firebaseUser = await admin.auth().getUserByEmail(normalizedEmail);
  
      try {
        await admin.auth().createCustomToken(firebaseUser.uid);
        console.log("Usuario autenticado en Firebase:", normalizedEmail);
      } catch (firebaseError) {
        console.error("Error en Firebase:", firebaseError.message);
        return res.status(401).json({
          code: "FIREBASE_AUTH_ERROR",
          message: "Error de autenticación en Firebase",
        });
      }
  
      // Verificar usuario en MongoDB
      const user = await User.findOne({ email: normalizedEmail });
      if (!user || user.firebaseUID !== firebaseUser.uid) {
        return res.status(401).json({ message: "Autenticación fallida" });
      }
  
      // Validar contraseña
      const isPasswordValid = await compareAsync(password, user.password);
      if (!isPasswordValid) {
        console.log("Contraseña incorrecta para el usuario:", normalizedEmail);
        return res
          .status(401)
          .json({ code: "INVALID_PASSWORD", message: "Contraseña incorrecta" });
      }
  
      // Generar token
      const token = jwt.sign(
        {
          userId: user._id,
          businessId: user.businessId,
          role: user.role,
          subRole: user.subRole || null, 
          businessName: user.businessName,
          accountCreator: user.accountCreator,
        },
        process.env.AUTH_SECRET,
        { expiresIn: "15m" }
      );
  
      console.log("Inicio de sesión exitoso para el usuario:", normalizedEmail);

      //Configuación que utilizo para desarrollo
       /* res.cookie("token", token, {
       httpOnly: true,
       secure: false, // `false` en desarrollo
       sameSite: "Strict", // `Podría usar Lax` en desarrollo
       maxAge: 15 * 60 * 1000, // 15 minutos
      }); */
  
      // Configuración para producción
      /* res.cookie('token', token, {
        httpOnly: true,
        secure: true, // `true` en producción
        sameSite: 'None', // `None` en producción
        maxAge: 15 * 60 * 1000, // 15 minutos
        path: '/',  // Esta línea la agregué para asegurar que la cookie esté accesible en toda la app
      }); */

      //Configuaración luego de configurar proxy en el frontend
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // `true` en producción
        sameSite: 'Lax',
        maxAge: 30* 60 * 1000, // 30 minutos
        path: '/', // Accesible en toda la app
        //domain: 'discount-project-web.vercel.app',
      });
  
      res.json({
        message: "Inicio de sesión exitoso",
        success: true,
        token: showToken ? token : null,
      });
    } catch (error) {
      console.error("Error en el proceso de autenticación:", error);
      res.status(500).json({
        code: "AUTHENTICATION_ERROR",
        message: "Error en la autenticación",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },  
  user_profile: async (req, res) => {
    const { userId, businessId } = req.user; // Extrae el userId del objeto req.user
    try {
      // Busca y trae datos del usuario en la base de datos excluyendo password, userId y businessId.
      const user = await User.findById(userId).select("-password -userId -businessId");

      //const business = await Business.findById(businessId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Validar que el usuario tenga un rol asignado
      if (!user.role) {
        return res
          .status(400)
          .json({ message: "El usuario no tiene un rol asignado" });
      }

      // Cargar las variables de entorno para los roles
      const roleAppAdmin = process.env.ROLE_APP_ADMIN;
      const roleBusinessDirector = process.env.ROLE_BUSINESS_DIRECTOR; 
      const roleBusinessManager = process.env.ROLE_BUSINESS_MANAGER;
      const roleBusinessEmployee = process.env.ROLE_BUSINESS_EMPLOYEE;
      const roleMobileCustomer = process.env.ROLE_MOBILE_CUSTOMER;

      // Definir la variable roleType
      let roleType = "";

      // Condicional para determinar el tipo de rol
      if (user.role === roleAppAdmin) {
        roleType = "appAdmin";
      } else if (user.role === roleBusinessDirector) {
        roleType = "businessDirector";
      } else if (user.role === roleBusinessManager) {
        roleType = "businessManager";
      } else if (user.role === roleBusinessEmployee) {
        roleType = "businessEmployee";
      } else if (user.role === roleMobileCustomer) {
        roleType = "mobileCustomer";
      }
  

      // Devuelve los datos del usuario. Si es un usurario con rol relacionado a un negocio al tener un businessId devuelve businesName y businessType, en cambio si el usuario tiene el rol roleAppAdmin al no poseer la propiedad businessId y no estar relacionado con un negocio no se le envían ni businessName ni businessType.
      if(businessId) {
        const business = await Business.findById(businessId);

        let subRoleDb = user.subRole;

        res.json({
          userRole: roleType,
          userName: user.name,
          businessName: business.businessName,
          businessType: business.businessType,
          userStatus: user.status,
          userSubRole: subRoleDb && "visit_user" || null
        });
      } else {
        res.json({
          userRole: roleType,
          userName: user.name,
          userStatus: user.status
        });
      }
    } catch (err) {
      // Registro del error en la consola para depuración
      console.error("Error al obtener los datos del usuario:", err);
      res
        .status(500)
        .json({ message: "Error al obtener los datos del usuario" });
    }
  },
  protected_route: async (req, res) => {
    try {
      const { userId } = req.user; // Extrae el userId del objeto req.user
      //const user = await User.findById(user_id);
      const user = await User.findById(userId);
      console.log("Valor de user en protected_route: ", user);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      res.json({
        success: true,
        //userId: user._id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Error interno del servidor" });
    }
  },
  checkEmail: async (req, res) => {
    const email = req.params.email.toLowerCase();

    try {
      console.log("Verificando email:", email);
      const user = await User.findOne({ email });

      if (!user) {
        res.json({
          success: false,
        });
        console.log(
          "Usuario no encontrado en la base de datos, pero se enviará el correo de restablecimiento de contraseña."
        );
      } else {

        const token = jwt.sign(
          { email: user.email },
          process.env.RESET_TOKEN_SECRET,
          {
            expiresIn: "15m",
          }
        );
  
        await sendMongoEmail(email, token);
        console.log("Correo electrónico de restablecimiento enviado a:", email);
  
        res.json({
          exists: !!user,
          success: true,
          message:
            "Correo electrónico de restablecimiento de MongoDB enviado correctamente",
          token,
        });
      }

    } catch (error) {
      console.error("Error al enviar el correo electrónico de MongoDB:", error);
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  },
  //Por el momento no la estoy utilizando
  /* checkEmailFromMobile: async (req, res) => {
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
  }, */
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
  pending_users: async (req, res) => {
    try {
      const roleBusinessDirector = process.env.ROLE_BUSINESS_DIRECTOR;
      // Buscar usuarios con estado "pending" y con rol ROLE_BUSINESS_DIRECTOR
      const users = await User.find({ status: "pending", role: roleBusinessDirector });

      // Iterar sobre los usuarios y ajustar el rol
      const pendingUsers = users.map((user) => {
        let roleType = "";

        // Cargar las variables de entorno para los roles
        const roleAppAdmin = process.env.ROLE_APP_ADMIN;
        const roleBusinessDirector = process.env.ROLE_BUSINESS_DIRECTOR; 
        const roleBusinessManager = process.env.ROLE_BUSINESS_MANAGER;
        const roleBusinessEmployee = process.env.ROLE_BUSINESS_EMPLOYEE;
        const roleMobileCustomer = process.env.ROLE_MOBILE_CUSTOMER;
  
        if (user.role === roleAppAdmin) {
          roleType = "appAdmin";
        } else if (user.role === roleBusinessDirector) {
          roleType = "businessDirector";
        } else if (user.role === roleBusinessManager) {
          roleType = "businessManager";
        } else if (user.role === roleBusinessEmployee) {
          roleType = "businessEmployee";
        } else if (user.role === roleMobileCustomer) {
          roleType = "mobileCustomer";
        }
  
        return {
          ...user._doc,  // _doc contiene los datos del usuario
          role: roleType,
        };
      });

      // Enviar la respuesta con la lista de usuarios pendientes y sus roles ajustados
      res.json(pendingUsers);
    } catch (error) {
      // Manejo de errores
      console.error("Error al obtener usuarios pendientes:", error);
      res.status(500).json({ message: "Error al obtener usuarios pendientes" });
    }
  },
  approve_user: async (req, res) => {
    const { _id } = req.params;
    console.log("Valor de userId en el controller approve_user: ", _id);

    try {
      // Buscar el usuario por su ID
      const user = await User.findById(_id);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Actualizar el estado del usuario a 'activo'
      user.status = "active"; // Asume que hay un campo 'status' que almacena el estado del usuario

      // Guardar los cambios
      await user.save();

      return res.status(200).json({ message: "Usuario aprobado exitosamente" });
      console.log("Usuario aprobado exitosamente");
    } catch (error) {
      console.error("Error al aprobar el usuario:", error);
      return res.status(500).json({ message: "Error al aprobar el usuario" });
    }
  },
  send_user_notification: async (req, res) => {
    const { userId, message } = req.body;

    try {
        // Busco al usuario por su ID
        const user = await User.findById(userId);

        // Verifico que el usuario exista y que su estado sea "pending"
        if (!user/*  || user.status !== 'pending' */) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado o no tiene estado pendiente.' });
        }

        // Creo la nueva notificación
        const newNotification = {
            message,
            timestamp: new Date(),
            read: false
        };

        // Agrego la notificación al array de notificaciones del usuario
        user.notifications.push(newNotification);

        // Guardo los cambios en el usuario
        await user.save();

        res.status(200).json({ success: true, message: 'Notificación enviada y guardada en el usuario.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al enviar notificación.' });
    }
  },
  user_pending_notifications: async (req, res) => {
    const { userId } = req.user; // Extrae el userId del objeto req.user

    try {
        // Busco al usuario por su ID
        const user = await User.findById(userId, 'notifications'); // Solo seleccionamos la propiedad notifications

        // Verifico que el usuario exista
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        // Devuelvo las notificaciones del usuario
        res.status(200).json({ success: true, notifications: user.notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener las notificaciones.' });
    }
  },
  mark_user_notification_as_read: async (req, res) => {
    const { notificationId } = req.body; // ID de la notificación (opcional)
    const { userId } = req.user; // ID del usuario, asegurado por la autenticación

    try {
        // Busco al usuario por su ID
        const user = await User.findById(userId);

        // Verifico que el usuario exista
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        if (notificationId) {
            // Si se proporciona un notificationId, marcar solo esa notificación como leída
            const notification = user.notifications.id(notificationId);
            if (!notification) {
                return res.status(404).json({ success: false, message: 'Notificación no encontrada.' });
            }

            // Marcar la notificación específica como leída
            notification.read = true;
        } else {
            // Si no se proporciona notificationId, marcar todas las notificaciones como leídas
            user.notifications.forEach((notification) => {
                notification.read = true;
            });
        }

        // Guardo los cambios en el usuario
        await user.save().catch(err => {
            console.error('Error al guardar el usuario:', err);
            return res.status(500).json({ success: false, message: 'Error al marcar las notificaciones como leídas.' });
        });

        // Respuesta exitosa
        res.status(200).json({ success: true, message: 'Notificaciones marcadas como leídas.' });

    } catch (error) {
        console.error('Error al marcar las notificaciones como leídas:', error);
        res.status(500).json({ success: false, message: 'Error al marcar las notificaciones como leídas.' });
    }
  },
  invitation_business_employee_user: async (req, res) => {
    const {
      email,
    } = req.body;

    const { businessId, businessName } = req.user; 

    try {
      const normalizedEmail = email.toLowerCase();

      let existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        console.log(
          "El correo electrónico ya está registrado:",
          normalizedEmail
        );
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está registrado" });
      } else {
        const qrScannerUserEmailToken = jwt.sign(
          { email: email },
          process.env.CREATE_USER_QR_SCANNER_SECRET,
          {
            expiresIn: "60m",
          }
        );

        await sendInvitationBusinessEmployeeUserEmail(email, qrScannerUserEmailToken, businessId, businessName);
        console.log(
          "Correo electrónico para crear usuario con acceso a Scanner enviado a:",
          email
        );

        res.json({
          //exists: !!user,
          success: true,
          message:
            "Correo electrónico con enlace para crear usuario con acceso a Scanner enviado correctamente",
        });
      }
    } catch (error) {
      console.error(
        "Error al procesar la solicitud de chequeo de email para crear cuenta:",
        error
      );
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  },
  create_business_employee_user: async (req, res) => {
    const { name, lastName, email, phone, password, businessId} = req.body;

    // Este condicional asegura que el email del token coincide con el email del body para que el usuario aceptado sea el que propone el administrador de la cuenta del negocio.
    /* if (req.user.email !== email) {
      return res.status(403).json({ error: "El email no coincide con el token proporcionado" });
    } */

    console.log("Valor de email: ", email);
    console.log("Valor de businessId: ", businessId);

    try {
      const normalizedEmail = email.toLowerCase();

      console.log("Datos recibidos para registro del usuario empleado de cuenta de negocio:", req.body);

      // Verificar si el correo ya existe en MongoDB
      let existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ error: "El correo electrónico ya está registrado" });
      }
  
      // Verificar si el correo ya existe en Firebase
      try {
        await admin.auth().getUserByEmail(normalizedEmail);
        return res.status(400).json({ error: "El correo electrónico ya está registrado en Firebase" });
      } catch (firebaseError) {
        if (firebaseError.code !== "auth/user-not-found") {
          console.error("Error al verificar usuario en Firebase:", firebaseError);
          return res.status(500).json({ error: "Error al verificar usuario en Firebase" });
        }
      }
  
      // Crear usuario en Firebase
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().createUser({
          email: normalizedEmail,
          password,
        });
        console.log("Usuario creado en Firebase:", firebaseUser.uid);
      } catch (error) {
        console.error("Error al crear usuario en Firebase:", error);
        if (error.code === "auth/weak-password") {
          return res.status(400).json({ error: "La contraseña es demasiado débil" });
        }
        if (error.code === "auth/invalid-email") {
          return res.status(400).json({ error: "El correo electrónico es inválido" });
        }
        return res.status(500).json({ error: "Error al crear usuario en Firebase" });
      }

      // Crear usuario en MongoDB

      const hashedPassword = await bcrypt.hash(password, 10);

      const roleBusinessEmployee = process.env.ROLE_BUSINESS_EMPLOYEE;

      const newUser = new User({
        name,
        lastName,
        businessId,
        email: normalizedEmail,
        originalEmail: email,
        phone: phone,
        password: hashedPassword,
        role: roleBusinessEmployee,
        status: "active",
        firebaseUID: firebaseUser.uid,
      });

      await newUser.save();
      console.log("Nuevo usuario con acceso a scanner en aplicación movil registrado:", newUser);

      res.json({
        message: "Registro exitoso como usuario con acceso a scanner en aplicación movil.",
        _id: newUser._id,
        name: newUser.name,
        lastName: newUser.lastName,
      });
    } catch (error) {
      console.error("Error en el registro de usuario con acceso a scanner en aplicación movil:", error);
      res.status(500).json({ error: "Error en el registro de usuario con acceso a scanner en aplicación movil" });
    }
  },
  invitation_extra_business_admin_user: async (req, res) => {
    const {
      email,
    } = req.body;

    const { businessId, businessName } = req.user; 

    try {
      const normalizedEmail = email.toLowerCase();

      let existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        console.log(
          "El correo electrónico ya está registrado:",
          normalizedEmail
        );
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está registrado" });
      } else {
        const qrExtraBusinessAdminUserEmailToken = jwt.sign(
          { email: email },
          process.env.CREATE_EXTRA_BUSINESS_ADMIN_USER_SECRET,
          {
            expiresIn: "60m",
          }
        );

        await sendInvitationExtraBusinessAdminUserEmail(email, qrExtraBusinessAdminUserEmailToken, businessId, businessName);
        console.log(
          "Correo electrónico para crear usuario con acceso a Scanner enviado a:",
          email
        );

        res.json({
          //exists: !!user,
          success: true,
          message:
            "Correo electrónico con enlace para crear usuario extra como administrador de la cuenta de negocio enviado correctamente",
        });
      }
    } catch (error) {
      console.error(
        "Error al procesar la solicitud de chequeo de email para crear cuenta de usuario extra como administrador de la cuenta de negocio :",
        error
      );
      res.status(500).json({ success: false, message: "Error en el servidor" });
    }
  },
  create_extra_business_admin_user: async (req, res) => {
    const { name, lastName, email, phone, password, businessId} = req.body;

    const asociateBusiness = await Business.findById(businessId) // Busco el negocio por su ID
      
    if (asociateBusiness) {

      // Este condicional asegura que el email del token coincide con el email del body para que el usuario aceptado sea el que propone el administrador de la cuenta del negocio.
      if (req.user.email !== email) {
        return res.status(403).json({ error: "El email no coincide con el token proporcionado" });
      }
  
      console.log("Valor de email: ", email);
      console.log("Valor de businessId: ", businessId);
  
      try {
        const normalizedEmail = email.toLowerCase();
  
        console.log("Datos recibidos para registro del usuario administrador de cuenta de negocio extra:", req.body);
  
        // Verificar si el correo ya existe en MongoDB
        let existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          return res.status(400).json({ error: "El correo electrónico ya está registrado" });
        }
    
        // Verificar si el correo ya existe en Firebase
        try {
          await admin.auth().getUserByEmail(normalizedEmail);
          return res.status(400).json({ error: "El correo electrónico ya está registrado en Firebase" });
        } catch (firebaseError) {
          if (firebaseError.code !== "auth/user-not-found") {
            console.error("Error al verificar usuario en Firebase:", firebaseError);
            return res.status(500).json({ error: "Error al verificar usuario en Firebase" });
          }
        }
    
        // Crear usuario en Firebase
        let firebaseUser;
        try {
          firebaseUser = await admin.auth().createUser({
            email: normalizedEmail,
            password,
          });
          console.log("Usuario creado en Firebase:", firebaseUser.uid);
        } catch (error) {
          console.error("Error al crear usuario en Firebase:", error);
          if (error.code === "auth/weak-password") {
            return res.status(400).json({ error: "La contraseña es demasiado débil" });
          }
          if (error.code === "auth/invalid-email") {
            return res.status(400).json({ error: "El correo electrónico es inválido" });
          }
          return res.status(500).json({ error: "Error al crear usuario en Firebase" });
        }
  
        // Crear usuario en MongoDB
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const roleBusinessManager = process.env.ROLE_BUSINESS_MANAGER;
  
        const newUser = new User({
          name,
          lastName,
          email: normalizedEmail,
          originalEmail: email,
          phone: phone,
          password: hashedPassword,
          businessId,
          //businessName: asociateBusiness.businessName,
          //businessType: asociateBusiness.businessType,
          role: roleBusinessManager,
          status: "active",
          firebaseUID: firebaseUser.uid,
        });
  
        await newUser.save();
        console.log("Nuevo usuario administrador de cuenta de negocio extra registrado exitosamente:", newUser);
  
        res.json({
          message: "Registro exitoso como usuario administrador de cuenta de negocio extra.",
          _id: newUser._id,
          name: newUser.name,
          lastName: newUser.lastName,
        });
      } catch (error) {
        console.error("Error en el registro de usuario administrador de cuenta de negocio extra:", error);
        res.status(500).json({ error: "Error en el registro de usuario administrador de cuenta de negocio extra" });
      }
    }
  },
  all_business_admin_users: async (req, res) => {
    const { businessId } = req.user;
    //const roleAdminWeb = process.env.ROLE_ADMINWEB;
    const roleBusinessDirector = process.env.ROLE_BUSINESS_DIRECTOR; 
    const roleBusinessManager = process.env.ROLE_BUSINESS_MANAGER;

    try {
      // Agrego logs para ver si los valores son correctos
      console.log("Business ID:", businessId);
      //console.log("Role Admin Web:", roleAdminWeb);
      
      if (!businessId || !roleBusinessDirector || !roleBusinessManager) {
        return res.status(400).json({ error: "Faltan parámetros necesarios" });
      }
  
      // Realizo la búsqueda
      const allUsers = await User.find({
        businessId, // Comparación con el businessId
        role: { $in: [roleBusinessDirector, roleBusinessManager] },//busca todos los roles administradores del negocio
        status: "active" // Solo usuarios activos
      });

      console.log("Usuarios Administradores Encontrados:", allUsers);
  
      if (!allUsers || allUsers.length === 0) {
        return res.status(404).json({ error: "No se encontraron usuarios administradores activos" });
      }

      const totalAdminsOneBusiness = allUsers.length;
      console.log("Valor de totalAdminsOneBusiness: ", totalAdminsOneBusiness);
  
      // Retorna los usuarios encontrados
      //res.json(allUsers);
      res.json(totalAdminsOneBusiness);
  
    } catch (error) {
      console.error("Error al buscar usuarios administradores de un negocio activos:", error);
      res.status(500).json({ error: "Error al buscar usuarios administradores de un negocio activos" });
    }
  },
  asociated_business_users: async (req, res) => {
    try {
      const { businessId } = req.user;
      // Buscar usuarios con estado "active" asociados a un negocio en particular.
      const users = await User.find({ businessId: businessId });

      // Iterar sobre los usuarios y ajustar el rol
      const activeAsociatedUsers = users.map((user) => {
        let roleType = "";

        // Cargar las variables de entorno para los roles
        const roleAppAdmin = process.env.ROLE_APP_ADMIN;
        const roleBusinessDirector = process.env.ROLE_BUSINESS_DIRECTOR; 
        const roleBusinessManager = process.env.ROLE_BUSINESS_MANAGER;
        const roleBusinessEmployee = process.env.ROLE_BUSINESS_EMPLOYEE;
        const roleMobileCustomer = process.env.ROLE_MOBILE_CUSTOMER;
  
        if (user.role === roleAppAdmin) {
          roleType = "appAdmin";
        } else if (user.role === roleBusinessDirector) {
          roleType = "businessDirector";
        } else if (user.role === roleBusinessManager) {
          roleType = "businessManager";
        } else if (user.role === roleBusinessEmployee) {
          roleType = "businessEmployee";
        } else if (user.role === roleMobileCustomer) {
          roleType = "mobileCustomer";
        }
  
        return {
          ...user._doc,  // _doc contiene los datos del usuario
          role: roleType,
        };
      });

      // Enviar la respuesta con la lista de usuarios activos asociados a un negocio en particular y sus roles ajustados
      res.json(activeAsociatedUsers);
    } catch (error) {
      // Manejo de errores
      console.error("Error al obtener usuarios activos asociados a un negocio:", error);
      res.status(500).json({ message: "Error al obtener usuarios activos asociados a un negocio" });
    }
  },
  desactivate_user: async (req, res) => {
    const { _id } = req.params;
    console.log("Valor de userId en el controller desactivate_user: ", _id);

    try {
      // Buscar el usuario por su ID
      const user = await User.findById(_id);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Actualizar el estado del usuario a 'pending'
      user.status = "pending"; // Asume que hay un campo 'status' que almacena el estado del usuario

     /*  const roleAdminWeb = process.env.ROLE_ADMINWEB;
      // Si es necesario, también puedes actualizar el rol del usuario
      user.role = roleAdminWeb; // Cambia el rol según lo que necesites */

      // Guardar los cambios
      await user.save();

      return res.status(200).json({ success: true, message: "Se modificó el status del usuario a pending  exitosamente" });
      console.log("El status del Usuario fue cambiado a 'pending' exitosamente");
    } catch (error) {
      console.error("Error al cambiar el estado del usuario de active a pending:", error);
      return res.status(500).json({ message: "Error al cambiar el estado del usuario de active a pending" });
    }
  },
  activate_user: async (req, res) => {
    const { _id } = req.params;
    console.log("Valor de userId en el controller activate_user: ", _id);

    try {
      // Buscar el usuario por su ID
      const user = await User.findById(_id);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Actualizar el estado del usuario a 'active'
      user.status = "active"; // Asume que hay un campo 'status' que almacena el estado del usuario

      // Guardar los cambios
      await user.save();

      return res.status(200).json({ success: true, message: "Se modificó el status del usuario a active  exitosamente" });
      console.log("El status del Usuario fue cambiado a 'active' exitosamente");
    } catch (error) {
      console.error("Error al cambiar el estado del usuario de pending a active:", error);
      return res.status(500).json({ message: "Error al cambiar el estado del usuario de pending a active" });
    }
  },
  delete_user: async (req, res) => {
    try {
      // Obtengo el ID del usuario desde los parámetros de la solicitud
      const userId = req.params._id;
  
      // Verifico si el ID del usuario es válido
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "ID de usuario es requerido" });
      }
  
      // Busco y elimino el usuario completamente de la base de datos
      const deletedUser = await User.findByIdAndDelete(userId);
  
      // Si no se encuentra el usuario, devuelve un error 404
      if (!deletedUser) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }
  
      // Si todo va bien, devuelve una respuesta de éxito
      res.status(200).json({
        success: true,
        message: "Usuario eliminado correctamente",
        deletedUser, // Devuelve el usuario eliminado
      });
    } catch (error) {
      // Captura cualquier error inesperado y devuelve una respuesta de error 500
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar el usuario",
        error: error.message,
      });
    }
  }  
};

export default controller;
