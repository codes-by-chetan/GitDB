import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AdminUser } from '../types/auth';
import { isPasswordValid } from '../utils/password';

export class AuthService {
  private readonly bootstrapUser: AdminUser = {
    id: 'bootstrap-admin',
    username: env.adminUsername,
    password: env.adminPassword,
    role: 'admin',
    status: 'active',
  };

  public login(username: string, password: string): { token: string; user: AdminUser } {
    if (username !== this.bootstrapUser.username) {
      throw new Error('Invalid credentials');
    }

    if (!isPasswordValid(this.bootstrapUser.password, password)) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { sub: this.bootstrapUser.id, username: this.bootstrapUser.username, role: this.bootstrapUser.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    return { token, user: { ...this.bootstrapUser } };
  }
}
