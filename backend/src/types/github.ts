export interface GitHubSession {
  accessToken: string;
  refreshToken?: string;
  username: string;
  displayName: string;
  avatar?: string;
  selectedRepository?: string;
  selectedBranch?: string;
  expiresAt?: string;
}
