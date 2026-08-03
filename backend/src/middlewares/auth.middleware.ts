import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../types/auth';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ success: false, message: 'Access token is missing or invalid', errorCode: 'UNAUTHORIZED' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { username: string; role: string };

    (req as AuthenticatedRequest).user = {
      id: 'bootstrap-admin',
      username: decoded.username,
      role: decoded.role as 'admin' | 'user',
    };

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token', errorCode: 'INVALID_TOKEN' });
  }
}

export function authorize(...allowedRoles: Array<'admin' | 'user'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
      return;
    }

    if (!allowedRoles.includes(authenticatedReq.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden', errorCode: 'FORBIDDEN' });
      return;
    }

    next();
  };
}
