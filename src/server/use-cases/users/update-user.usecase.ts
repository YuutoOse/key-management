import type {
  UpdateUserInput,
  UserRepository,
} from "@/server/domain/users/repository";

type Deps = { userRepo: UserRepository };

export const updateUser =
  (deps: Deps) =>
  (input: UpdateUserInput): Promise<void> =>
    deps.userRepo.update(input);
