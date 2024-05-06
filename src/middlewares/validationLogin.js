import { check } from 'express-validator';

const validationsLogin = [
    check('email').isEmail().normalizeEmail().withMessage('El correo electrónico no es válido'), // El campo email debe ser un correo electrónico válido
    check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'), // El campo contraseña debe tener al menos 6 caracteres
];

module.exports = validationsLogin; 