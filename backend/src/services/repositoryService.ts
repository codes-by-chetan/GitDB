import fs from 'fs';
import path from 'path';
import { RepositoryModel } from '../models/repository';

export class RepositoryService {
  private readonly repositoriesRoot = path.join(process.cwd(), 'backend', 'storage', 'repositories');

  public listRepositories(): RepositoryModel[] {
    const repositories: RepositoryModel[] = [];
    if (!fs.existsSync(this.repositoriesRoot)) {
      return repositories;
    }

    for (const ownerDir of fs.readdirSync(this.repositoriesRoot, { withFileTypes: true })) {
      if (!ownerDir.isDirectory()) continue;
      const ownerPath = path.join(this.repositoriesRoot, ownerDir.name);
      for (const repoDir of fs.readdirSync(ownerPath, { withFileTypes: true })) {
        if (!repoDir.isDirectory()) continue;
        const repoPath = path.join(ownerPath, repoDir.name);
        const gitDir = path.join(repoPath, '.git');
        const exists = fs.existsSync(gitDir);
        const safeName = repoDir.name.replace(/[^a-zA-Z0-9._-]+/g, '-').toLowerCase();
        repositories.push({
          id: `${ownerDir.name}/${safeName}`,
          name: safeName,
          owner: ownerDir.name,
          visibility: 'private',
          defaultBranch: 'main',
          updatedAt: new Date().toISOString(),
          size: 0,
          cloneStatus: exists ? 'cloned' : 'not-cloned',
          syncStatus: 'idle',
          description: 'Repository managed by GitDB',
        });
      }
    }
    return repositories;
  }

  public createRepository(input: { name: string; description?: string; visibility: 'public' | 'private'; initializeReadme: boolean; defaultBranch: string }): RepositoryModel {
    const safeName = input.name.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').toLowerCase();
    if (!safeName) {
      throw new Error('Repository name is invalid');
    }

    const owner = 'local';
    const targetPath = path.join(this.repositoriesRoot, owner, safeName);
    fs.mkdirSync(targetPath, { recursive: true });

    if (input.initializeReadme) {
      fs.writeFileSync(path.join(targetPath, 'README.md'), `# ${safeName}\n`);
    }

    return {
      id: `${owner}/${safeName}`,
      name: safeName,
      owner,
      visibility: input.visibility,
      defaultBranch: input.defaultBranch || 'main',
      updatedAt: new Date().toISOString(),
      size: 0,
      cloneStatus: 'cloned',
      syncStatus: 'idle',
      description: input.description,
    };
  }
}
