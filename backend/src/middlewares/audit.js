import { query } from '../config/db.js';

export const auditLog = (req, res, next) => {
  const method = req.method;
  
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const route = req.originalUrl;
    const pathParts = route.split('/').filter(Boolean);
    
    let entity_type = null;
    let entity_id = null;

    // Detect entity type and ID from path (e.g., /users/123)
    for (let i = 0; i < pathParts.length; i++) {
      if (pathParts[i + 1] && /^[0-9a-fA-F-]+$/.test(pathParts[i + 1])) {
        entity_type = pathParts[i];
        entity_id = pathParts[i + 1];
        break;
      }
    }
    
    if (!entity_type && pathParts.length > 0) {
      entity_type = pathParts[0] === 'api' ? pathParts[1] : pathParts[0];
    }

    const user_id = req.user?.id || null;
    const ip = req.ip || req.socket?.remoteAddress;

    // Asynchronous insert
    query(
      'INSERT INTO audit_logs (method, route, entity_type, entity_id, user_id, ip) VALUES ($1, $2, $3, $4, $5, $6)',
      [method, route, entity_type, entity_id, user_id, ip]
    ).catch(err => {
      console.error('Failed to write audit log:', err);
    });
  }
  
  next();
};
