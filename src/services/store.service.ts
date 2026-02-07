import { randomUUID } from "node:crypto";
import { getStoreRepo } from "../db/index.js";
import type { CreateStoreBody, Store, UpdateStoreBody } from "../schemas/store.js";

export function listStores(): Promise<Store[]> {
  return getStoreRepo().getAll();
}

export function getStoreById(id: string): Promise<Store | undefined> {
  return getStoreRepo().getById(id);
}

export async function createStore(body: CreateStoreBody): Promise<Store> {
  const store: Store = {
    id: randomUUID(),
    name: body.name,
    createdAt: new Date().toISOString(),
  };
  await getStoreRepo().create(store);
  return store;
}

export function updateStore(id: string, body: UpdateStoreBody): Promise<Store | undefined> {
  return getStoreRepo().update(id, body.name);
}

export async function deleteStore(id: string): Promise<boolean> {
  return getStoreRepo().delete(id);
}
