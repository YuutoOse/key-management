import type { UserRepository } from "@/server/domain/users/repository";

type Deps = { userRepo: UserRepository };

export const deleteUser =
  (deps: Deps) =>
  (userId: string): Promise<void> =>
    deps.userRepo.delete(userId);
