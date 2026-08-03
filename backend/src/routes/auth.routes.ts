import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/authService';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController(new AuthService());

router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/status', authenticate, authorize('admin'), authController.status);

export default router;
