import type { User } from "@/server/domain/users/entity";
import type { UserRepository } from "@/server/domain/users/repository";

type Deps = { userRepo: UserRepository };

export const listUsers = (deps: Deps) => (): Promise<User[]> =>
  deps.userRepo.findAll();
