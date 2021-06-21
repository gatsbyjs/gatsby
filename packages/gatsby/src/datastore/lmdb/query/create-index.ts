import { inspect } from "util"
import { store } from "../../../redux"
import { IGatsbyNode } from "../../../redux/types"
import { IDataStore, ILmdbDatabases } from "../../types"
import { cartesianProduct, resolveFieldValue } from "./common"

interface IDataStoreContext {
  databases: ILmdbDatabases
  datastore: IDataStore
}

export interface IIndexFields {
  [dottedField: string]: number
}

export const undefinedSymbol = Symbol(`undef`)

export type IndexFieldValue =
  | number
  | string
  | boolean
  | null
  | typeof undefinedSymbol
  | Array<IndexFieldValue>

export type IndexKey = Array<IndexFieldValue>

export async function createIndex(
  context: IDataStoreContext,
  typeName: string,
  indexFields: IIndexFields
): Promise<boolean> {
  const indexName = buildIndexName(typeName, indexFields)
  const metadataKey = `index:${indexName}`

  const { state } = context.databases.metadata.get(metadataKey) ?? {}

  switch (state) {
    case `ready`:
      return true
    case `building`: {
      await indexReady(context, metadataKey)
      return true
    }
    case `initial`:
    default: {
      try {
        await lockIndex(context, metadataKey)
      } catch (err) {
        // Index is being updated in some other process.
        // Wait and assume it's in a good state when done
        await indexReady(context, metadataKey)
        return true
      }
      await doCreateIndex(context, typeName, indexFields)
      await markIndexReady(context, metadataKey)
      return true
    }
  }
}

async function doCreateIndex(
  context: IDataStoreContext,
  typeName: string,
  indexFields: IIndexFields
): Promise<void> {
  const { datastore, databases } = context
  const { indexes } = databases
  const indexName = buildIndexName(typeName, indexFields)

  const label = `Indexing ${indexName}`
  console.time(label)
  let promise

  const indexFieldNames = Object.keys(indexFields)
  const resolvedNodes = store.getState().resolvedNodesCache.get(typeName)

  // console.log(`index entries:`)
  // TODO: iterate only over dirty nodes
  // TODO: wrap in async transaction?
  for (const node of datastore.iterateNodesByType(typeName)) {
    // Assuming materialization was run (executing custom resolvers for fields in `filter` and `sort` clauses)
    //  And materialized values of those fields are stored in resolvedNodes
    const resolvedFields = resolvedNodes?.get(node.id)
    const indexKeys = prepareIndexKeys(
      node,
      resolvedFields,
      indexName,
      indexFieldNames
    )
    for (const indexKey of indexKeys) {
      // assertAllowedIndexValue(typeName, fieldSelector, value, node.id)
      // console.log(indexKey, node.id)
      promise = indexes.put(indexKey, node.id)
    }
  }
  await promise
  console.timeEnd(label)
}

/**
 * Returns a list of index keys for a given node.
 * One node may produce multiple index entries when indexing over array values.
 *
 * For example:
 *  Node: { foo: [{ bar: `bar1`}, { bar: `bar2` }] }
 *  Index fields: [`foo.bar`] will produce the following elements: [`bar1`, `bar2`]
 *
 * Keys are prefixed with index name and suffixed with node counter for stable sort.
 *
 * If materialization result (resolvedFields) exists for a given index field
 *  it is used as a key element, otherwise the a raw node value is used.
 */
function prepareIndexKeys(
  node: IGatsbyNode,
  resolvedFields: { [field: string]: unknown } | undefined,
  indexName: string,
  indexFieldNames: Array<string>
): Array<IndexKey> {
  // TODO: use index id vs index name (shorter)
  const indexKeyElements: Array<Array<IndexFieldValue>> = []

  indexKeyElements.push([indexName])
  for (const dottedField of indexFieldNames) {
    const fieldValue = resolveFieldValue(dottedField, node, resolvedFields)
    let indexFieldValue = jsValueToLmdbKey(fieldValue)

    // Got value that can't be stored in lmdb key (e.g. contains arbitrary object)
    if (typeof indexFieldValue === `undefined`) {
      const path = `${node.internal.type}.${dottedField} (id: ${node.id})`
      throw new Error(`Bad value at ${path}: ${inspect(fieldValue)}`)
    }
    indexFieldValue = Array.isArray(indexFieldValue)
      ? indexFieldValue.flat() // FIXME
      : [indexFieldValue]

    indexKeyElements.push(indexFieldValue)
  }
  indexKeyElements.push([node.internal.counter])

  return cartesianProduct(...indexKeyElements)
}

async function lockIndex(
  context: IDataStoreContext,
  indexKey: string
): Promise<void> {
  const { metadata } = context.databases

  const justLocked = await metadata.ifNoExists(indexKey, () => {
    metadata.put(indexKey, { state: `building` })
  })
  if (!justLocked && metadata.get(indexKey)?.state === `building`) {
    throw new Error(`Index is already locked`)
  }
}

async function markIndexReady(
  context: IDataStoreContext,
  indexName: string
): Promise<void> {
  const { metadata } = context.databases
  await metadata.put(indexName, { state: `ready` })
}

async function indexReady(
  context: IDataStoreContext,
  indexKey: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const { metadata } = context.databases

    let retries = 0
    function poll(): void {
      if (metadata.get(indexKey)?.state === `ready`) {
        resolve()
        return
      }
      if (retries++ > 3000) {
        reject(new Error(`Index ${indexKey} is locked for more than 5 minutes`))
        return
      }
      setTimeout(poll, 100)
    }
    poll()
  })
}
//
// switch (indexMetadata?.state) {
//   default:
//     //
//     break
// }
//
// let retries = 0
// return new Promise((resolve, reject) => {
//   setTimeout(() => {
//     if (retries++ > 1000) {
//       reject(Error(`Could not `))
//     }
//   }, 100)
// })
// }

/**
 * Autogenerate index name based on parameters.
 *
 * Example:
 *
 * buildIndexName(`Foo`, { foo: 1, bar: -1 }) -> `Foo/foo:1/bar:-1
 */
function buildIndexName(
  typeName: string,
  fields: { [key: string]: number }
): string {
  const tokens: Array<string> = [typeName]

  for (const field of Object.keys(fields)) {
    const sortOrder = fields[field]
    tokens.push(`${field}:${sortOrder}`)
  }

  return tokens.join(`/`)
}

function jsValueToLmdbKey(value: unknown): IndexFieldValue | undefined {
  if (
    typeof value === `number` ||
    typeof value === `string` ||
    typeof value === `boolean` ||
    value === null
  ) {
    return value
  }
  if (typeof value === `undefined`) {
    // Array keys containing `undefined` are not supported by lmdb-store
    //  But we can't exclude those nodes from an index because
    //  filters { eq: null, gte: null, lte: null } are expected to return such nodes
    return undefinedSymbol
  }
  if (Array.isArray(value)) {
    const result: Array<IndexFieldValue> = []
    for (const item of value) {
      const lmdbKey = jsValueToLmdbKey(item)
      if (typeof lmdbKey === `undefined`) {
        return undefined // bad value
      }
      result.push(lmdbKey)
    }
    return result
  }
  // FIXME: not sure if we want this but there are tests for this :/
  if (typeof value === `object`) {
    return JSON.stringify(value)
  }
  return undefined
}
