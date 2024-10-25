/**
 * Middleware para autorizar roles específicos
 * @param {string[]} allowedRoles - Array de roles permitidos
 * @returns Middleware que verifica el rol del usuario
 */
export const authorizeRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Verificar si req.user existe (el usuario debería haber sido autenticado antes)
      if (!req.user) {
        return res.status(401).json({ message: "Se requiere autenticación." });
      }

      // Verificar si el rol del usuario está en los roles permitidos
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Acceso denegado, no cuentas con los permisos necesarios." });
      }

      console.log("Valor del rol de usuario recuperado con req.user.role en el Middleware authorizeRole Scanner: ", req.user.role);
      next(); // Continuar si tiene permisos

    } catch (error) {
      // Manejar errores inesperados
      console.error("Error en authorizeRole middleware:", error);
      return res.status(500).json({ message: "Error Interno del Servidor" });
    }
  };
};
