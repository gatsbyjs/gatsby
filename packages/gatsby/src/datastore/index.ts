import { setupLmdbStore } from "./lmdb/lmdb-datastore"
import { IDataStore } from "./types"

let dataStore: IDataStore

export function getDataStore(): IDataStore {
  if (!dataStore) {
    // dataStore = process.env.GATSBY_EXPERIMENTAL_STRICT_MODE
    //   ? getLmdbDatastore()
    //   : undefined
    dataStore = setupLmdbStore()
  }
  return dataStore
}
