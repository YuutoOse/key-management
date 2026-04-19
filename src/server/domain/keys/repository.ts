import type { Key } from "./entity";

export type KeyRepository = {
  findAll(): Promise<Key[]>;
  findManyByIds(ids: string[]): Promise<Key[]>;
};
