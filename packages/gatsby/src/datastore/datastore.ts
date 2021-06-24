import { IDataStore } from "./types"
import { emitter } from "../redux"

let dataStore: IDataStore
let isLmdb = isLmdbStoreFlagSet()

export function getDataStore(): IDataStore {
  if (!dataStore) {
    if (isLmdb) {
      const { setupLmdbStore } = require(`./lmdb/lmdb-datastore`)
      dataStore = setupLmdbStore()
    } else {
      const { setupInMemoryStore } = require(`./in-memory/in-memory-datastore`)
      dataStore = setupInMemoryStore()
    }
  }
  return dataStore
}

export function isLmdbStore(): boolean {
  return isLmdb
}

export function detectLmdbStore(): boolean {
  const flagIsSet = isLmdbStoreFlagSet()

  if (dataStore && isLmdb !== flagIsSet) {
    throw new Error(
      `GATSBY_EXPERIMENTAL_LMDB_STORE flag had changed after the data store was initialized.` +
        `(original value: ${isLmdb ? `true` : `false`}, ` +
        `new value: ${flagIsSet ? `true` : `false`})`
    )
  }
  isLmdb = flagIsSet
  return flagIsSet
}

function isLmdbStoreFlagSet(): boolean {
  if (process.env.NODE_ENV === `test`) {
    console.info(`IS LMDB`)
    return true
  }
  // return true
  return (
    Boolean(process.env.GATSBY_EXPERIMENTAL_LMDB_STORE) &&
    process.env.GATSBY_EXPERIMENTAL_LMDB_STORE !== `false` &&
    process.env.GATSBY_EXPERIMENTAL_LMDB_STORE !== `0`
  )
}

// It is possible that the store is not initialized yet when calling `DELETE_CACHE`.
//  The code below ensures we wipe cache from the proper store
//  (mostly relevant for tests)
emitter.on(`DELETE_CACHE`, () => {
  getDataStore()
})
