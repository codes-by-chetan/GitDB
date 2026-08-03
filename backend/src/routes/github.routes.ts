import { Router } from 'express';
import { GitHubController } from '../controllers/githubController';
import { GitHubService } from '../services/githubService';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new GitHubController(new GitHubService());

router.get('/status', authenticate, authorize('admin'), controller.status);
router.get('/connect', authenticate, authorize('admin'), controller.connect);
router.post('/connect', authenticate, authorize('admin'), controller.connect);
router.get('/callback', controller.callback);
router.post('/disconnect', authenticate, authorize('admin'), controller.disconnect);

export default router;
