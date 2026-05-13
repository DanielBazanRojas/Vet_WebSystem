export const checkPermission = (moduleName, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { permissions } = req.user;
    
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(403).json({ message: 'No tiene permisos asignados' });
    }

    const hasPermission = permissions.some(
      p => p.module === moduleName && p.action === action
    );

    if (!hasPermission) {
      return res.status(403).json({ message: 'No tiene permisos para realizar esta acción' });
    }

    next();
  };
};
