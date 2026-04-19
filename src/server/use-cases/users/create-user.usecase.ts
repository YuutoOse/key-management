import type {
  CreateUserInput,
  UserRepository,
} from "@/server/domain/users/repository";

type Deps = { userRepo: UserRepository };

export const createUser =
  (deps: Deps) =>
  (input: CreateUserInput): Promise<void> =>
    deps.userRepo.create(input);
