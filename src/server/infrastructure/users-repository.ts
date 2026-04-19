import { eq, isNull } from "drizzle-orm";
import type { User, UserRole } from "@/server/domain/users/entity";
import type {
  ChangePasswordInput,
  CreateUserInput,
  UpdateUserInput,
  UserRepository,
} from "@/server/domain/users/repository";
import { auth } from "@/server/lib/auth";
import { db } from "@/server/lib/db";
import * as schema from "@/server/lib/db/schema";

export const createUserRepository = (headers: Headers): UserRepository => ({
  findAll: async (): Promise<User[]> => {
    const rows = await db
      .select()
      .from(schema.user)
      .where(isNull(schema.user.deletedAt));
    return rows.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role === "admin" ? "admin" : "user") as UserRole,
      banned: user.banned ?? false,
      createdAt: user.createdAt,
    }));
  },

  create: async (input: CreateUserInput): Promise<void> => {
    await auth.api.createUser({ body: input, headers });
  },

  update: async (input: UpdateUserInput): Promise<void> => {
    await auth.api.adminUpdateUser({
      body: {
        userId: input.userId,
        data: { name: input.name, role: input.role },
      },
      headers,
    });
    if (input.password) {
      await auth.api.setUserPassword({
        body: { userId: input.userId, newPassword: input.password },
        headers,
      });
    }
  },

  delete: async (userId: string): Promise<void> => {
    await db
      .update(schema.user)
      .set({
        deletedAt: new Date(),
        banned: true,
        banReason: "アカウントが削除されました",
      })
      .where(eq(schema.user.id, userId));
  },

  changePassword: async (input: ChangePasswordInput): Promise<void> => {
    await auth.api.changePassword({ body: input, headers });
  },
});
