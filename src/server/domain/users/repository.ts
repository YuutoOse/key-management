import type { User, UserRole } from "./entity";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserInput = {
  userId: string;
  name: string;
  role: UserRole;
  password?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type UserRepository = {
  findAll(): Promise<User[]>;
  create(input: CreateUserInput): Promise<void>;
  update(input: UpdateUserInput): Promise<void>;
  delete(userId: string): Promise<void>;
  changePassword(input: ChangePasswordInput): Promise<void>;
};
