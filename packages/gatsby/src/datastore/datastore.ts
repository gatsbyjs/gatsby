import { IDataStore } from "./types"
import { emitter } from "../redux"

let dataStore: IDataStore

export function getDataStore(): IDataStore {
  if (!dataStore) {
    const { setupLmdbStore } = require(`./lmdb/lmdb-datastore`)
    dataStore = setupLmdbStore()
  }
  return dataStore
}

// It is possible that the store is not initialized yet when calling `DELETE_CACHE`.
//  The code below ensures we wipe cache from the proper store
//  (mostly relevant for tests)
emitter.on(`DELETE_CACHE`, () => {
  getDataStore()
})
