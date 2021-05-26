import { setupLmdbStore } from "./lmdb/lmdb-datastore"
import { setupInMemoryStore } from "./in-memory/in-memory-datastore"
import { IDataStore } from "./types"
import { isStrictMode } from "../utils/is-strict-mode"

let dataStore: IDataStore
let isLmdb

export function getDataStore(): IDataStore {
  if (!dataStore) {
    isLmdb = isStrictMode()
    dataStore = isLmdb ? setupLmdbStore() : setupInMemoryStore()
  } else if (isLmdb !== isStrictMode()) {
    // Sanity check to make sure the mode hadn't changed after initialization
    throw new Error(
      `Data store was initialized for ${isLmdb ? `strict` : `default`} mode` +
        `but the mode had changed to ${isStrictMode() ? `strict` : `default`}.`
    )
  }
  return dataStore
}
