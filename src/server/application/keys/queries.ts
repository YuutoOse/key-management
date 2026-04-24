import { createKeyRepository } from "@/server/infrastructure/db/keys-repository";
import { db } from "@/server/lib/db";
import { listKeys } from "@/server/use-cases/keys/list-keys.usecase";

export const getKeys = () => listKeys({ keyRepo: createKeyRepository(db) })();
