import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { LoggingService } from './loggingService';
import { GitHubSession } from '../types/github';

export class GitHubService {
  private readonly sessionPath = path.join(process.cwd(), 'backend', 'config', 'session.json');
  private readonly logger = new LoggingService();
  private readonly pendingStates = new Map<string, number>();

  public async getStatus(): Promise<{ connected: boolean; session?: GitHubSession }> {
    if (!fs.existsSync(this.sessionPath)) {
      return { connected: false };
    }

    const raw = fs.readFileSync(this.sessionPath, 'utf8');
    const session = JSON.parse(raw) as GitHubSession;
    const connected = Boolean(session.accessToken && session.expiresAt && new Date(session.expiresAt).getTime() > Date.now());

    if (!connected) {
      this.logger.log({ timestamp: new Date().toISOString(), user: 'admin', action: 'restore-github-session', duration: 0, result: 'expired', error: 'GitHub session expired' });
      this.clearSession();
      return { connected: false };
    }

    return { connected, session };
  }

  public buildAuthorizationUrl(): { url: string; state: string } {
    if (!env.githubClientId) {
      throw new Error('GitHub OAuth is not configured. Set GITHUB_CLIENT_ID in the environment.');
    }

    const state = crypto.randomBytes(16).toString('hex');
    this.pendingStates.set(state, Date.now());

    const params = new URLSearchParams({
      client_id: env.githubClientId,
      redirect_uri: env.githubRedirectUri,
      scope: env.githubScopes,
      state,
    });

    return { url: `https://github.com/login/oauth/authorize?${params.toString()}`, state };
  }

  public async exchangeCode(code: string, state: string): Promise<GitHubSession> {
    const createdAt = this.pendingStates.get(state);
    if (!createdAt) {
      throw new Error('Invalid OAuth state');
    }

    this.pendingStates.delete(state);

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.githubClientId,
        client_secret: env.githubClientSecret,
        code,
        redirect_uri: env.githubRedirectUri,
        state,
      }),
    });

    const tokenPayload = (await response.json()) as { access_token?: string; error?: string; error_description?: string };
    if (!tokenPayload.access_token || tokenPayload.error) {
      throw new Error(tokenPayload.error_description || 'Unable to exchange GitHub code for a token');
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${tokenPayload.access_token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const userPayload = (await userResponse.json()) as { login?: string; name?: string; avatar_url?: string };

    const session: GitHubSession = {
      accessToken: tokenPayload.access_token,
      username: userPayload.login || '',
      displayName: userPayload.name || userPayload.login || '',
      avatar: userPayload.avatar_url,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    await this.saveSession(session);
    return session;
  }

  public async saveSession(session: GitHubSession): Promise<void> {
    fs.mkdirSync(path.dirname(this.sessionPath), { recursive: true });
    fs.writeFileSync(this.sessionPath, JSON.stringify(session, null, 2));
    this.logger.log({ timestamp: new Date().toISOString(), user: 'admin', action: 'save-github-session', duration: 0, result: 'success' });
  }

  public async clearSession(): Promise<void> {
    if (fs.existsSync(this.sessionPath)) {
      fs.unlinkSync(this.sessionPath);
    }
  }
}
