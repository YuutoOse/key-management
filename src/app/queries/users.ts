import "server-only";
import { headers } from "next/headers";
import { createUserRepository } from "@/server/infrastructure/users-repository";
import { listUsers } from "@/server/use-cases/users/list-users.usecase";

export const queryUsers = async () => {
  const userRepo = createUserRepository(await headers());
  return listUsers({ userRepo })();
};
