import { Router } from 'express';
import { RepoController } from '../controllers/repoController';
import { RepositoryService } from '../services/repositoryService';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const controller = new RepoController(new RepositoryService());

router.get('/', authenticate, authorize('admin'), controller.list);
router.post('/create', authenticate, authorize('admin'), controller.create);
router.post('/select', authenticate, authorize('admin'), controller.select);

export default router;
