import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

export const env = {
  port: Number(process.env.PORT || 3000),
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  jwtSecret: process.env.JWT_SECRET || 'gitdb-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  githubClientId: process.env.GITHUB_CLIENT_ID || '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  githubRedirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/github/callback',
  githubScopes: process.env.GITHUB_SCOPES || 'repo,user:email',
};
