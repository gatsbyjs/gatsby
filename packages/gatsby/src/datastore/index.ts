import { setupLmdbStore } from "./lmdb/lmdb-datastore"
import { setupInMemoryStore } from "./in-memory/in-memory-datastore"
import { IDataStore } from "./types"

let dataStore: IDataStore

export function getDataStore(): IDataStore {
  if (!dataStore) {
    dataStore = process.env.GATSBY_EXPERIMENTAL_STRICT_MODE
      ? setupLmdbStore()
      : setupInMemoryStore()
  }
  return dataStore
}
