import { Router } from 'express';
import { GitService } from '../services/gitService';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const gitService = new GitService();

router.get('/status', authenticate, authorize('admin'), async (req, res) => {
  const repoPath = (req.query.repoPath as string | undefined) || 'backend/storage/repositories/local';
  try {
    const status = await gitService.status(repoPath);
    res.json({ success: true, message: 'Git status retrieved', data: { status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to read git status', errorCode: 'GIT_ERROR' });
  }
});

router.post('/pull', authenticate, authorize('admin'), async (req, res) => {
  const repoPath = (req.body.repoPath as string | undefined) || 'backend/storage/repositories/local';
  try {
    const output = await gitService.pull(repoPath);
    res.json({ success: true, message: 'Pull completed', data: { output } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to pull repository', errorCode: 'GIT_ERROR' });
  }
});

router.post('/push', authenticate, authorize('admin'), async (req, res) => {
  const repoPath = (req.body.repoPath as string | undefined) || 'backend/storage/repositories/local';
  try {
    const output = await gitService.push(repoPath);
    res.json({ success: true, message: 'Push completed', data: { output } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to push repository', errorCode: 'GIT_ERROR' });
  }
});

router.post('/fetch', authenticate, authorize('admin'), async (req, res) => {
  const repoPath = (req.body.repoPath as string | undefined) || 'backend/storage/repositories/local';
  try {
    const output = await gitService.fetch(repoPath);
    res.json({ success: true, message: 'Fetch completed', data: { output } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch repository', errorCode: 'GIT_ERROR' });
  }
});

export default router;
