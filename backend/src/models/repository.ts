export interface RepositoryModel {
  id: string;
  name: string;
  owner: string;
  visibility: 'public' | 'private';
  defaultBranch: string;
  updatedAt: string;
  size: number;
  cloneStatus: 'not-cloned' | 'cloned' | 'syncing';
  syncStatus: 'idle' | 'syncing' | 'error';
  description?: string;
}
