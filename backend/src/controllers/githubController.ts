import { Request, Response } from 'express';
import { GitHubService } from '../services/githubService';

export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  public status = async (_req: Request, res: Response): Promise<void> => {
    const status = await this.githubService.getStatus();
    res.json({ success: true, message: 'GitHub status retrieved', data: status });
  };

  public connect = async (_req: Request, res: Response): Promise<void> => {
    try {
      const { url } = this.githubService.buildAuthorizationUrl();
      res.json({ success: true, message: 'GitHub authorization started', data: { redirectUrl: url } });
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unable to start GitHub OAuth', errorCode: 'GITHUB_OAUTH_ERROR' });
    }
  };

  public callback = async (req: Request, res: Response): Promise<void> => {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';

    if (!code || !state) {
      res.status(400).send('GitHub authorization was rejected.');
      return;
    }

    try {
      await this.githubService.exchangeCode(code, state);
      res.redirect('/');
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'Unable to complete GitHub authorization.');
    }
  };

  public disconnect = async (_req: Request, res: Response): Promise<void> => {
    await this.githubService.clearSession();
    res.json({ success: true, message: 'GitHub session removed', data: {} });
  };
}
