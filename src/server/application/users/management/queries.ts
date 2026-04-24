import { createUserRepository } from "@/server/infrastructure/users-repository";
import { listUsers } from "@/server/use-cases/users/list-users.usecase";

export const getUsers = (headers: Headers) =>
  listUsers({ userRepo: createUserRepository(headers) })();
