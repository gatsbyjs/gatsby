import { IDataStore } from "./types"
import { isLmdbStore } from "../utils/is-lmdb-store"
import { emitter } from "../redux"

let dataStore: IDataStore
let isLmdb

export function getDataStore(): IDataStore {
  if (!dataStore) {
    isLmdb = isLmdbStore()
    if (isLmdb) {
      const { setupLmdbStore } = require(`./lmdb/lmdb-datastore`)
      dataStore = setupLmdbStore()
    } else {
      const { setupInMemoryStore } = require(`./in-memory/in-memory-datastore`)
      dataStore = setupInMemoryStore()
    }
  } else if (isLmdb !== isLmdbStore()) {
    // Sanity check to make sure the mode hadn't changed after initialization
    throw new Error(
      `GATSBY_EXPERIMENTAL_LMDB_STORE flag had changed after the data store was initialized.` +
        `(original value: ${isLmdb ? `true` : `false`}, ` +
        `new value: ${isLmdbStore() ? `true` : `false`})`
    )
  }
  return dataStore
}

// It is possible that the store is not initialized yet when calling `DELETE_CACHE`.
//  The code below ensures we wipe cache from the proper store
//  (mostly relevant for tests)
emitter.on(`DELETE_CACHE`, () => {
  getDataStore()
})
