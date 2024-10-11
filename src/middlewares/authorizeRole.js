// authorizeRole.js
/**
 * Middleware para autorizar roles específicos
 * @param {string[]} allowedRoles - Array de roles permitidos
 * @returns Middleware que verifica el rol del usuario
 */
export const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied, insufficient permissions" });
      }
      console.log("Valor del rol de usuario recuperado con req.user.role en el Middleware authorizeRole: ", req.user.role);
      next();
    };
  };
  