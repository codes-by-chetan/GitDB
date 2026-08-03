export type UserRole = 'admin' | 'user';

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    username: string;
    role: UserRole;
  };
}
