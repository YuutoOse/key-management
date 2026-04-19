import type { Key } from "@/server/domain/keys/entity";
import type { KeyRepository } from "@/server/domain/keys/repository";

type Deps = { keyRepo: KeyRepository };

export const listKeys = (deps: Deps) => (): Promise<Key[]> =>
  deps.keyRepo.findAll();
