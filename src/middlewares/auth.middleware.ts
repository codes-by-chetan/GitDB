import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { verifyToken } from '../auth/jwt';
import { getUserByUsername } from '../auth/adminStore';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token is missing or invalid' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    const user = getUserByUsername(decoded.username);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({ success: false, message: 'User is inactive' });
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function authorize(...allowedRoles: Array<'admin' | 'user'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(authenticatedReq.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    next();
  };
}
