import { Request, Response, Router } from 'express';
import { getUserByUsername } from '../auth/adminStore';
import { isPasswordValid } from '../auth/password';
import { signToken } from '../auth/jwt';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { AuthenticatedRequest } from '../types/auth';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ success: false, message: 'Username and password are required' });
    return;
  }

  const user = getUserByUsername(username);
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const isValid = isPasswordValid(user.password, password);
  if (!isValid) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const token = signToken({ sub: user.id, username: user.username, role: user.role });
  res.json({ success: true, message: 'Login successful', data: { token, user: { id: user.id, username: user.username, role: user.role } } });
});

router.post('/logout', authenticate, (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logout successful', data: {} });
});

router.get('/status', authenticate, authorize('admin'), (req: Request, res: Response) => {
  res.json({ success: true, message: 'Authenticated', data: { user: (req as AuthenticatedRequest).user } });
});

export default router;
