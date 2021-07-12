import { inspect } from "util"
import { store } from "../../../redux"
import { IGatsbyNode } from "../../../redux/types"
import { IDataStore, ILmdbDatabases } from "../../types"
import { cartesianProduct, resolveFieldValue } from "./common"

interface IIndexingContext {
  databases: ILmdbDatabases
  datastore: IDataStore
}

export type IndexFields = Map<string, number> // name, direction

export interface IIndexMetadata {
  state: "ready" | "building" | "stale" | "error" | "initial"
  error?: string
  typeName: string
  keyPrefix: number | string
  keyFields: Array<[fieldName: string, orderDirection: number]>
  multiKeyFields: Array<string>

  // Stats for multi-key indexes
  // (e.g. when node is { id: `id`, foo: [1,2] } it translates into two index keys: [1,`id`], [2,`id`])
  stats: {
    keyCount: number
    itemCount: number
    maxKeysPerItem: number
  }
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
  context: IIndexingContext,
  typeName: string,
  indexFields: IndexFields
): Promise<IIndexMetadata> {
  const indexName = buildIndexName(typeName, indexFields)
  const meta = getIndexMetadata(context, typeName, indexFields, false)

  switch (meta?.state) {
    case `ready`:
      return meta
    case `building`: {
      return indexReady(context, indexName)
    }
    case `initial`:
    default: {
      try {
        await lockIndex(context, indexName)
      } catch (err) {
        // Index is being updated in some other process.
        // Wait and assume it's in a good state when done
        return indexReady(context, indexName)
      }
      return doCreateIndex(context, typeName, indexFields)
    }
  }
}

export function getIndexMetadata(
  context: IIndexingContext,
  typeName: string,
  indexFields: IndexFields,
  assertReady = true
): IIndexMetadata {
  const { databases } = context
  const indexName = buildIndexName(typeName, indexFields)
  const meta: IIndexMetadata = databases.metadata.get(toMetadataKey(indexName))

  if (assertReady && meta?.state !== `ready`) {
    throw new Error(
      `Index ${indexName} is not ready yet. State: ${meta?.state ?? `unknown`}`
    )
  }
  return meta
}

async function doCreateIndex(
  context: IIndexingContext,
  typeName: string,
  indexFields: IndexFields
): Promise<IIndexMetadata> {
  const { datastore, databases } = context
  const { indexes, metadata } = databases
  const indexName = buildIndexName(typeName, indexFields)

  const label = `Indexing ${indexName}`
  console.time(label)

  // Assuming materialization was run before creating index
  const resolvedNodes = store.getState().resolvedNodesCache.get(typeName)

  // TODO: iterate only over dirty nodes
  // TODO: wrap in async transaction?
  const stats: IIndexMetadata["stats"] = {
    maxKeysPerItem: 0,
    keyCount: 0,
    itemCount: 0,
  }
  const indexMetadata: IIndexMetadata = {
    state: `building`,
    typeName,
    keyFields: [...indexFields],
    multiKeyFields: [],
    keyPrefix: indexName, // FIXME
    stats,
  }

  try {
    let i = 0
    for (const node of datastore.iterateNodesByType(typeName)) {
      // Assuming materialization was run (executing custom resolvers for fields in `filter` and `sort` clauses)
      //  And materialized values of those fields are stored in resolvedNodes
      const resolvedFields = resolvedNodes?.get(node.id)
      const { keys, multiKeyFields } = prepareIndexKeys(
        node,
        resolvedFields,
        indexName,
        indexFields
      )
      stats.keyCount += keys.length
      stats.itemCount++
      stats.maxKeysPerItem = Math.max(stats.maxKeysPerItem, keys.length)
      indexMetadata.multiKeyFields.push(...multiKeyFields)

      for (const indexKey of keys) {
        // Note: this may throw if indexKey exceeds 1978 chars (lmdb limit) or contain objects/buffers/etc
        indexes.put(indexKey, node.id)
      }
      if (++i % 5000 === 0) {
        // Do not block event loop too much
        await new Promise(resolve => setTimeout(resolve, 3))
      }
    }
    indexMetadata.state = `ready`
    indexMetadata.multiKeyFields = [...new Set(indexMetadata.multiKeyFields)]

    await metadata.put(toMetadataKey(indexName), indexMetadata)
    console.timeEnd(label)

    return indexMetadata
  } catch (e) {
    indexMetadata.state = `error`
    indexMetadata.error = String(e)
    await metadata.put(toMetadataKey(indexName), indexMetadata)
    throw e
  }
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
  indexFields: IndexFields
): { keys: Array<IndexKey>; multiKeyFields: Array<string> } {
  // TODO: use index id vs index name (shorter)
  const indexKeyElements: Array<Array<IndexFieldValue>> = []
  const multiKeyFields: Array<string> = []

  indexKeyElements.push([indexName])
  for (const dottedField of indexFields.keys()) {
    const fieldValue = resolveFieldValue(dottedField, node, resolvedFields)
    let indexFieldValue = jsValueToLmdbKey(fieldValue)

    // Got value that can't be stored in lmdb key
    if (typeof indexFieldValue === `undefined`) {
      const path = `${node.internal.type}.${dottedField} (id: ${node.id})`
      throw new Error(`Bad value at ${path}: ${inspect(fieldValue)}`)
    }
    indexFieldValue = Array.isArray(indexFieldValue)
      ? indexFieldValue.flat() // FIXME
      : [indexFieldValue]

    indexKeyElements.push(indexFieldValue)

    if (indexFieldValue.length > 1) {
      multiKeyFields.push(dottedField)
    }
  }
  indexKeyElements.push([node.internal.counter])

  return { keys: cartesianProduct(...indexKeyElements), multiKeyFields }
}

async function lockIndex(
  context: IIndexingContext,
  indexName: string
): Promise<void> {
  const { metadata } = context.databases
  const indexKey = toMetadataKey(indexName)

  const justLocked = await metadata.ifNoExists(indexKey, () => {
    metadata.put(indexKey, null)
  })
  if (!justLocked) {
    throw new Error(`Index is already locked`)
  }
}

async function indexReady(
  context: IIndexingContext,
  indexName: string
): Promise<IIndexMetadata> {
  return new Promise((resolve, reject) => {
    const { metadata } = context.databases

    let retries = 0
    let timeout = 16
    function poll(): void {
      const indexMetadata = metadata.get(toMetadataKey(indexName))
      if (indexMetadata?.state === `ready`) {
        resolve(indexMetadata)
        return
      }
      if (retries++ > 1000) {
        reject(new Error(`Index ${indexName} is locked for too long`))
        return
      }
      setTimeout(poll, timeout)
      timeout = Math.min(200, timeout * 1.5)
    }
    poll()
  })
}

/**
 * Autogenerate index name based on parameters.
 *
 * Example:
 *
 * buildIndexName(`Foo`, { foo: 1, bar: -1 }) -> `Foo/foo:1/bar:-1
 */
function buildIndexName(typeName: string, fields: IndexFields): string {
  const tokens: Array<string> = [typeName]

  for (const [field, sortDirection] of fields) {
    tokens.push(`${field}:${sortDirection}`)
  }

  return tokens.join(`/`)
}

function toMetadataKey(indexName: string): string {
  return `index:${indexName}`
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
    // Furthermore, lmdb-store puts those keys before others and we want them to be below
    //  so need to add additional padding
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
