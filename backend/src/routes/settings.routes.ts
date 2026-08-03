import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController';
import { SettingsService } from '../services/settingsService';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new SettingsController(new SettingsService());

router.get('/', authenticate, authorize('admin'), controller.getSettings);
router.post('/', authenticate, authorize('admin'), controller.saveSettings);

export default router;
