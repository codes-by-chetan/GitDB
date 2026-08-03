import { Request, Response } from 'express';
import { RepositoryService } from '../services/repositoryService';

export class RepoController {
  constructor(private readonly repositoryService: RepositoryService) {}

  public list = (_req: Request, res: Response): void => {
    res.json({ success: true, message: 'Repositories retrieved', data: { repositories: this.repositoryService.listRepositories() } });
  };

  public create = (req: Request, res: Response): void => {
    const body = req.body as { name?: string; description?: string; visibility?: 'public' | 'private'; initializeReadme?: boolean; defaultBranch?: string };
    if (!body.name) {
      res.status(400).json({ success: false, message: 'Repository name is required', errorCode: 'VALIDATION_ERROR' });
      return;
    }

    const repo = this.repositoryService.createRepository({
      name: body.name,
      description: body.description,
      visibility: body.visibility || 'private',
      initializeReadme: body.initializeReadme ?? true,
      defaultBranch: body.defaultBranch || 'main',
    });

    res.json({ success: true, message: 'Repository created', data: { repository: repo } });
  };

  public select = (req: Request, res: Response): void => {
    const { repository } = req.body as { repository?: string };
    const value = repository?.trim() || null;
    res.json({ success: true, message: 'Repository selected', data: { selectedRepository: value } });
  };
}
