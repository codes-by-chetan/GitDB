import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export class GitService {
  private readonly maxBuffer = 1024 * 1024;

  private async run(args: string[], options: { cwd?: string } = {}): Promise<string> {
    const { stdout } = await execFileAsync('git', args, { maxBuffer: this.maxBuffer, cwd: options.cwd });
    return stdout.trim();
  }

  public async clone(targetPath: string, repoUrl: string, branch?: string): Promise<string> {
    const args = ['clone', repoUrl, targetPath];
    if (branch) {
      args.splice(2, 0, '--branch', branch);
    }
    return this.run(args);
  }

  public async fetch(repoPath: string): Promise<string> {
    return this.run(['-C', repoPath, 'fetch', '--all']);
  }

  public async pull(repoPath: string): Promise<string> {
    return this.run(['-C', repoPath, 'pull']);
  }

  public async push(repoPath: string): Promise<string> {
    return this.run(['-C', repoPath, 'push']);
  }

  public async add(repoPath: string, files: string[] = ['.']): Promise<string> {
    return this.run(['-C', repoPath, 'add', ...files]);
  }

  public async commit(repoPath: string, message: string): Promise<string> {
    return this.run(['-C', repoPath, 'commit', '-m', message]);
  }

  public async status(repoPath: string): Promise<string> {
    return this.run(['-C', repoPath, 'status', '--short']);
  }

  public async checkout(repoPath: string, branch: string): Promise<string> {
    return this.run(['-C', repoPath, 'checkout', branch]);
  }

  public async currentBranch(repoPath: string): Promise<string> {
    return this.run(['-C', repoPath, 'branch', '--show-current']);
  }

  public async createBranch(repoPath: string, branch: string): Promise<string> {
    return this.run(['-C', repoPath, 'checkout', '-b', branch]);
  }

  public async ensureRepository(repoPath: string): Promise<boolean> {
    return fs.existsSync(path.join(repoPath, '.git'));
  }
}
