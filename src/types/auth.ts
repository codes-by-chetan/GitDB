export type UserRole = 'admin' | 'user';

export interface UserRecord {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    username: string;
    role: UserRole;
  };
}
