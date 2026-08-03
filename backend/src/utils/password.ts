import bcrypt from 'bcryptjs';

export function isPasswordValid(storedPassword: string, providedPassword: string): boolean {
  if (!storedPassword || !providedPassword) {
    return false;
  }

  if (storedPassword === providedPassword) {
    return true;
  }

  try {
    return bcrypt.compareSync(providedPassword, storedPassword);
  } catch {
    return false;
  }
}
