import { env } from '../config/env';
import { UserRecord } from '../types/auth';

const adminUser: UserRecord = {
  id: 'bootstrap-admin',
  username: env.adminUsername,
  password: env.adminPassword,
  role: 'admin',
  status: 'active',
};

const userStore: UserRecord[] = [adminUser];

export function getUserByUsername(username: string): UserRecord | undefined {
  return userStore.find((user) => user.username === username);
}

export function addUser(user: UserRecord): void {
  userStore.push(user);
}
