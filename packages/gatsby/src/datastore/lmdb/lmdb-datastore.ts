import { RootDatabase, open } from "lmdb-store"
// import { performance } from "perf_hooks"
import { ActionsUnion, IGatsbyNode } from "../../redux/types"
import { updateNodes } from "./updates/nodes"
import { updateNodesByType } from "./updates/nodes-by-type"
import { IDataStore, IGatsbyIterable, ILmdbDatabases } from "../types"
import { emitter, replaceReducer } from "../../redux"

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
      sharedStructuresKey: Symbol.for(`structures`),
      compression: true,
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
        cache: true,
      }),
      nodesByType: rootDb.openDB({
        name: `nodesByType`,
        dupSort: true,
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

function iterateNodes(): IGatsbyIterable<IGatsbyNode> {
  // Additionally fetching items by id to leverage lmdb-store cache
  const nodesDb = getDatabases().nodes
  return nodesDb
    .getKeys({ snapshot: false })
    .map(nodeId => getNode(nodeId)!)
    .filter(Boolean)
}

function iterateNodesByType(type: string): IGatsbyIterable<IGatsbyNode> {
  const nodesByType = getDatabases().nodesByType
  return nodesByType
    .getValues(type)
    .map(nodeId => getNode(nodeId)!)
    .filter(Boolean)
}

function getNode(id: string): IGatsbyNode | undefined {
  if (!id) return undefined
  const { nodes } = getDatabases()
  return nodes.get(id)
}

function getTypes(): Array<string> {
  return getDatabases().nodesByType.getKeys({}).asArray
}

function countNodes(typeName?: string): number {
  if (!typeName) {
    const stats = getDatabases().nodes.getStats()
    // @ts-ignore
    return Number(stats.entryCount || 0)
  }

  const { nodesByType } = getDatabases()
  let count = 0
  nodesByType.getValues(typeName).forEach(() => {
    count++
  })
  return count
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
      })
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

/**
 * Resolves when all the data is synced
 */
async function ready(): Promise<void> {
  await lastOperationPromise
}

export function setupLmdbStore(): IDataStore {
  const lmdbDatastore = {
    getNode,
    getTypes,
    countNodes,
    iterateNodes,
    iterateNodesByType,
    updateDataStore,
    ready,

    // deprecated:
    getNodes,
    getNodesByType,
  }
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
  return lmdbDatastore
}
