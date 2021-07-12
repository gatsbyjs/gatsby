import { RootDatabase, open } from "lmdb-store"
import { performance } from "perf_hooks"
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

const rootDbFile =
  process.env.NODE_ENV === `test`
    ? `test-datastore-${
        // FORCE_TEST_DATABASE_ID will be set if this gets executed in worker context
        // when running jest tests. JEST_WORKER_ID will be set when this gets executed directly
        // in test context (jest will use jest-worker internally).
        process.env.FORCE_TEST_DATABASE_ID ?? process.env.JEST_WORKER_ID
      }`
    : `datastore`

let rootDb
let databases

function getRootDb(): RootDatabase {
  if (!rootDb) {
    rootDb = open({
      name: `root`,
      path: process.cwd() + `/.cache/data/` + rootDbFile,
      compression: true,
      maxReaders: 1024,
    })
  }
  return rootDb
}

function getDatabases(): ILmdbDatabases {
  if (!databases) {
    const rootDb = getRootDb()
    databases = {
      nodes: rootDb.openDB({
        name: `nodes`,
        // FIXME: sharedStructuresKey breaks tests - probably need some cleanup for it on DELETE_CACHE
        sharedStructuresKey: Symbol.for(`structures`),
        // @ts-ignore
        cache: true,
        // cache: { expirer: false },
        // cache: true,
        // encoding: `json`,
      }),
      nodesByType: rootDb.openDB({
        name: `nodesByType`,
        dupSort: true,
      }),
      metadata: rootDb.openDB({
        name: `metadata`,
        useVersions: true,
        // readOnly: Boolean(process.env.GATSBY_WORKER_ID),
      }),
      indexes: rootDb.openDB({
        name: `indexes`,
        // TODO: use dupSort when this is ready: https://github.com/DoctorEvidence/lmdb-store/issues/66
        // dupSort: true
        // readOnly: Boolean(process.env.GATSBY_WORKER_ID),
      }),
    }
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
      .map(
        nodeId => (typeof nodeId === `string` ? getNode(nodeId) : undefined)!
      )
      .filter(Boolean)
  )
}

function iterateNodesByType(type: string): GatsbyIterable<IGatsbyNode> {
  const nodesByType = getDatabases().nodesByType
  return new GatsbyIterable(
    nodesByType
      .getValues(type)
      .map(nodeId => getNode(nodeId)!)
      .filter(Boolean)
  )
}

let getNodeTime = 0
let totalCalls = 0

function getNode(id: string): IGatsbyNode | undefined {
  if (!id) return undefined
  const { nodes } = getDatabases()
  const start = performance.now()
  const result = nodes.get(id)
  getNodeTime += performance.now() - start
  totalCalls++
  return result
}

function getTypes(): Array<string> {
  return getDatabases().nodesByType.getKeys({}).asArray
}

function countNodes(typeName?: string): number {
  if (!typeName) {
    const stats = getDatabases().nodes.getStats()
    // @ts-ignore
    return Number(stats.entryCount || 0) // FIXME: add -1 when restoring shared structures key
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
        dbs.nodes.clear()
        dbs.nodesByType.clear()
        dbs.metadata.clear()
        dbs.indexes.clear()
      })
      break
    }
    case `SET_PROGRAM`: {
      // TODO: remove this when we have support for incremental indexes in lmdb
      clearIndexes()
      break
    }
    case `CREATE_NODE`:
    case `ADD_FIELD_TO_NODE`:
    case `ADD_CHILD_NODE_TO_PARENT_NODE`:
    case `DELETE_NODE`: {
      const dbs = getDatabases()
      lastOperationPromise = Promise.all([
        updateNodes(dbs.nodes, action),
        updateNodesByType(dbs.nodesByType, action),
      ])
    }
  }
}

function clearIndexes(): void {
  const dbs = getDatabases()
  dbs.nodes.transactionSync(() => {
    dbs.metadata.clear()
    dbs.indexes.clear()
  })
}

/**
 * Resolves when all the data is synced
 */
async function ready(): Promise<void> {
  await lastOperationPromise
}

export function setupLmdbStore(): IDataStore {
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
  setInterval(() => {
    console.log(
      `Time spent in getNode: ${getNodeTime / 1000}; totalCalls: ${totalCalls}`
    )
  }, 10000)
  // TODO: remove this when we have support for incremental indexes in lmdb
  clearIndexes()
  return lmdbDatastore
}
