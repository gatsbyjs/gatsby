import { RootDatabase, open, ArrayLikeIterable } from "lmdb"
// import { performance } from "perf_hooks"
import { ActionsUnion, IGatsbyNode } from "../../redux/types"
import { updateNodes } from "./updates/nodes"
import { updateNodesByType } from "./updates/nodes-by-type"
import { IDataStore, ILmdbDatabases, IQueryResult } from "../types"
import { emitter, replaceReducer } from "../../redux"
import { GatsbyIterable } from "../common/iterable"
import { doRunQuery } from "./query/run-query"
import {
  IRunFilterArg,
  runFastFiltersAndSort,
} from "../in-memory/run-fast-filters"

const lmdbDatastore = {
  getNode,
  getTypes,
  countNodes,
  iterateNodes,
  iterateNodesByType,
  updateDataStore,
  ready,
  runQuery,

  // deprecated:
  getNodes,
  getNodesByType,
}

const preSyncDeletedNodeIdsCache = new Set()

export function getDefaultDbPath(): string {
  const dbFileName =
    process.env.NODE_ENV === `test`
      ? `test-datastore-${
          // FORCE_TEST_DATABASE_ID will be set if this gets executed in worker context
          // when running jest tests. JEST_WORKER_ID will be set when this gets executed directly
          // in test context (jest will use jest-worker internally).
          process.env.FORCE_TEST_DATABASE_ID ?? process.env.JEST_WORKER_ID
        }`
      : `datastore`

  return process.cwd() + `/.cache/data/` + dbFileName
}

let fullDbPath
let rootDb
let databases

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Global {
      __GATSBY_OPEN_LMDBS?: Map<string, ILmdbDatabases>
      __GATSBY_OPEN_ROOT_LMDBS?: Map<string, RootDatabase>
    }
  }
}

function getRootDb(): RootDatabase {
  if (!rootDb) {
    if (!fullDbPath) {
      throw new Error(`LMDB path is not set!`)
    }

    if (!globalThis.__GATSBY_OPEN_ROOT_LMDBS) {
      globalThis.__GATSBY_OPEN_ROOT_LMDBS = new Map()
    }
    rootDb = globalThis.__GATSBY_OPEN_ROOT_LMDBS.get(fullDbPath)
    if (rootDb) {
      return rootDb
    }

    rootDb = open({
      name: `root`,
      path: fullDbPath,
      compression: true,
    })

    globalThis.__GATSBY_OPEN_ROOT_LMDBS.set(fullDbPath, rootDb)
  }
  return rootDb
}

function getDatabases(): ILmdbDatabases {
  if (!databases) {
    // __GATSBY_OPEN_LMDBS tracks if we already opened given db in this process
    // In `gatsby serve` case we might try to open it twice - once for engines
    // and second to get access to `SitePage` nodes (to power trailing slashes
    // redirect middleware). This ensure there is single instance within a process.
    // Using more instances seems to cause weird random errors.
    if (!globalThis.__GATSBY_OPEN_LMDBS) {
      globalThis.__GATSBY_OPEN_LMDBS = new Map()
    }
    databases = globalThis.__GATSBY_OPEN_LMDBS.get(fullDbPath)
    if (databases) {
      return databases
    }

    const rootDb = getRootDb()
    databases = {
      nodes: rootDb.openDB({
        name: `nodes`,
        // FIXME: sharedStructuresKey breaks tests - probably need some cleanup for it on DELETE_CACHE
        // sharedStructuresKey: Symbol.for(`structures`),
        // @ts-ignore
        cache: {
          // expirer: false disables LRU part and only take care of WeakRefs
          // this way we don't retain nodes strongly, but will continue to
          // reuse them if they are loaded already
          expirer: false,
        },
      }),
      nodesByType: rootDb.openDB({
        name: `nodesByType`,
        dupSort: true,
      }),
      metadata: rootDb.openDB({
        name: `metadata`,
        useVersions: true,
      }),
      indexes: rootDb.openDB({
        name: `indexes`,
        // TODO: use dupSort when this is ready: https://github.com/DoctorEvidence/lmdb-store/issues/66
        // dupSort: true
      }),
    }
    globalThis.__GATSBY_OPEN_LMDBS.set(fullDbPath, databases)
  }
  return databases
}

/**
 * @deprecated
 */
function getNodes(): Array<IGatsbyNode> {
  // const start = performance.now()
  const result = Array.from<IGatsbyNode>(iterateNodes())
  // const timeTotal = performance.now() - start
  // console.warn(
  //   `getNodes() is deprecated, use iterateNodes() instead; ` +
  //     `array length: ${result.length}; time(ms): ${timeTotal}`
  // )
  return result ?? []
}

/**
 * @deprecated
 */
function getNodesByType(type: string): Array<IGatsbyNode> {
  // const start = performance.now()
  const result = Array.from<IGatsbyNode>(iterateNodesByType(type))
  // const timeTotal = performance.now() - start
  // console.warn(
  //   `getNodesByType() is deprecated, use iterateNodesByType() instead; ` +
  //     `array length: ${result.length}; time(ms): ${timeTotal}`
  // )
  return result ?? []
}

function iterateNodes(): GatsbyIterable<IGatsbyNode> {
  // Additionally fetching items by id to leverage lmdb-store cache
  const nodesDb = getDatabases().nodes
  return new GatsbyIterable(
    nodesDb
      .getKeys({ snapshot: false })
      .map(nodeId => (typeof nodeId === `string` ? getNode(nodeId) : undefined))
      .filter(Boolean) as ArrayLikeIterable<IGatsbyNode>
  )
}

function iterateNodesByType(type: string): GatsbyIterable<IGatsbyNode> {
  const nodesByType = getDatabases().nodesByType
  return new GatsbyIterable(
    nodesByType
      .getValues(type)
      .map(nodeId => getNode(nodeId))
      .filter(Boolean) as ArrayLikeIterable<IGatsbyNode>
  )
}

function getNode(id: string): IGatsbyNode | undefined {
  if (!id || preSyncDeletedNodeIdsCache.has(id)) {
    return undefined
  }

  const { nodes } = getDatabases()
  return nodes.get(id)
}

function getTypes(): Array<string> {
  return getDatabases().nodesByType.getKeys({}).asArray
}

function countNodes(typeName?: string): number {
  if (!typeName) {
    const stats = getDatabases().nodes.getStats() as { entryCount: number }
    return Math.max(
      Number(stats.entryCount) - preSyncDeletedNodeIdsCache.size,
      0
    ) // FIXME: add -1 when restoring shared structures key
  }

  const { nodesByType } = getDatabases()
  return nodesByType.getValuesCount(typeName)
}

async function runQuery(args: IRunFilterArg): Promise<IQueryResult> {
  if (process.env.GATSBY_EXPERIMENTAL_LMDB_INDEXES) {
    return await doRunQuery({
      datastore: lmdbDatastore,
      databases: getDatabases(),
      ...args,
    })
  }
  return Promise.resolve(runFastFiltersAndSort(args))
}

let lastOperationPromise: Promise<any> = Promise.resolve()

function updateDataStore(action: ActionsUnion): void {
  switch (action.type) {
    case `DELETE_CACHE`: {
      const dbs = getDatabases()
      // Force sync commit
      dbs.nodes.transactionSync(() => {
        dbs.nodes.clearSync()
        dbs.nodesByType.clearSync()
        dbs.metadata.clearSync()
        dbs.indexes.clearSync()
      })
      break
    }
    case `SET_PROGRAM`: {
      // TODO: remove this when we have support for incremental indexes in lmdb
      clearIndexes()
      break
    }
    case `CREATE_NODE`:
    case `DELETE_NODE`:
    case `ADD_FIELD_TO_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`:
    case `MATERIALIZE_PAGE_MODE`: {
      const dbs = getDatabases()
      const operationPromise = Promise.all([
        updateNodes(dbs.nodes, action),
        updateNodesByType(dbs.nodesByType, action),
      ])
      lastOperationPromise = operationPromise

      // if create is used in the same transaction as delete we should remove it from cache
      if (action.type === `CREATE_NODE`) {
        preSyncDeletedNodeIdsCache.delete(action.payload.id)
      }

      if (action.type === `DELETE_NODE` && action.payload?.id) {
        preSyncDeletedNodeIdsCache.add(action.payload.id)
        operationPromise.then(() => {
          // only clear if no other operations have been done in the meantime
          if (lastOperationPromise === operationPromise) {
            preSyncDeletedNodeIdsCache.clear()
          }
        })
      }
    }
  }
}

function clearIndexes(): void {
  const dbs = getDatabases()
  dbs.nodes.transactionSync(() => {
    dbs.metadata.clearSync()
    dbs.indexes.clearSync()
  })
}

/**
 * Resolves when all the data is synced
 */
async function ready(): Promise<void> {
  await lastOperationPromise
}

export function setupLmdbStore({
  dbPath = getDefaultDbPath(),
}: { dbPath?: string } = {}): IDataStore {
  fullDbPath = dbPath

  replaceReducer({
    nodes: (state = new Map(), action) =>
      action.type === `DELETE_CACHE` ? new Map() : state,
    nodesByType: (state = new Map(), action) =>
      action.type === `DELETE_CACHE` ? new Map() : state,
  })
  emitter.on(`*`, action => {
    if (action) {
      updateDataStore(action)
    }
  })
  // TODO: remove this when we have support for incremental indexes in lmdb
  clearIndexes()
  return lmdbDatastore
}
