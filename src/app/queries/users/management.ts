import "server-only";
import { headers } from "next/headers";
import { getUsers } from "@/server/application/users/management/queries";

export const queryUsers = async () => getUsers(await headers());
