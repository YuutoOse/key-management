import "server-only";
import { getKeys } from "@/server/application/keys/queries";

export const queryKeys = () => getKeys();
