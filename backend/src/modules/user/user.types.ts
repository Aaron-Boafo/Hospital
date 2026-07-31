import type { UserRole } from "./user.constants.js";

export interface LoginInput {
  idToken: string;
}

export interface UserDto {
  id: string;
  name: string;
  email: string | null;
  role: UserRole;
  active: boolean;
  createdAt: Date;
}

export interface AuthResult {
  token: string;
  user: UserDto;
}
