import type {
  ChangePasswordInput,
  UserRepository,
} from "@/server/domain/users/repository";

type Deps = { userRepo: UserRepository };

export const changePassword =
  (deps: Deps) =>
  (input: ChangePasswordInput): Promise<void> =>
    deps.userRepo.changePassword(input);
