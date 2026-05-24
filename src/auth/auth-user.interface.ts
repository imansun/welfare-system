import { UserRole } from '../users/user-role.enum';

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  role: UserRole;
}
