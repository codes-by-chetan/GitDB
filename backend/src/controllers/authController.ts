import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoggingService } from '../services/loggingService';
import { AuthenticatedRequest } from '../types/auth';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly logger = new LoggingService();

  public login = (req: Request, res: Response): void => {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username and password are required', errorCode: 'VALIDATION_ERROR' });
      return;
    }

    try {
      const result = this.authService.login(username, password);
      this.logger.log({ timestamp: new Date().toISOString(), user: username, action: 'admin-login', duration: 0, result: 'success' });
      res.json({ success: true, message: 'Login successful', data: result });
    } catch (error) {
      this.logger.log({ timestamp: new Date().toISOString(), user: username, action: 'admin-login', duration: 0, result: 'failure', error: error instanceof Error ? error.message : 'Authentication failed' });
      res.status(401).json({ success: false, message: error instanceof Error ? error.message : 'Authentication failed', errorCode: 'INVALID_CREDENTIALS' });
    }
  };

  public logout = (_req: Request, res: Response): void => {
    res.json({ success: true, message: 'Logout successful', data: {} });
  };

  public status = (req: Request, res: Response): void => {
    const authenticatedReq = req as AuthenticatedRequest;
    res.json({ success: true, message: 'Authenticated', data: { user: authenticatedReq.user } });
  };
}
