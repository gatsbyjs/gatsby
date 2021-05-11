import { ArrayLikeIterable, open, RootDatabase } from "lmdb-store"
// import { performance } from "perf_hooks"
import { ActionsUnion, IGatsbyNode } from "../../redux/types"
import { updateNodes } from "./updates/nodes"
import { updateNodesByType } from "./updates/nodes-by-type"
import { IDataStore, ILmdbDatabases } from "../types"
import { emitter } from "../../redux"

const rootDbFile =
  process.env.NODE_ENV === `test`
    ? `test-datastore-${process.env.JEST_WORKER_ID}`
    : `datastore`

let rootDb
let databases

function getRootDb(): RootDatabase {
  if (!rootDb) {
    rootDb = open({
      name: `root`,
      path: process.cwd() + `/.data/` + rootDbFile,
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
        sharedStructuresKey: Symbol.for(`structures`),
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

function getNodes(): Array<IGatsbyNode> {
  // const start = performance.now()
  const result = iterateNodes().asArray
  // const timeTotal = performance.now() - start
  // console.warn(
  //   `getNodes() is deprecated, use iterateNodes() instead; ` +
  //     `array length: ${result.length}; time(ms): ${timeTotal}`
  // )
  return result
}

function getNodesByType(type: string): Array<IGatsbyNode> {
  // const start = performance.now()
  const result = iterateNodesByType(type).asArray
  // const timeTotal = performance.now() - start
  // console.warn(
  //   `getNodesByType() is deprecated, use iterateNodesByType() instead; ` +
  //     `array length: ${result.length}; time(ms): ${timeTotal}`
  // )
  return result
}

function iterateNodes(): ArrayLikeIterable<IGatsbyNode> {
  // Additionally fetching items by id to leverage lmdb-store cache
  const nodesDb = getDatabases().nodes
  return nodesDb
    .getKeys({ snapshot: false })
    .map(nodeId => getNode(nodeId)!)
    .filter(Boolean)
}

function iterateNodesByType(type: string): ArrayLikeIterable<IGatsbyNode> {
  const nodesByType = getDatabases().nodesByType
  return nodesByType
    .getValues(type)
    .map(nodeId => getNode(nodeId)!)
    .filter(Boolean)
}

function getNode(id: string): IGatsbyNode | undefined {
  if (!id) return undefined
  const { nodes } = getDatabases()
  const node = nodes.get(id)
  if (!node) {
    // console.warn(`No node for ${id}`)
  }
  return node
}

function getTypes(): Array<string> {
  return getDatabases().nodesByType.getKeys({}).asArray
}

function hasNodeChanged(id: string, digest: string): boolean {
  const node = getNode(id)
  if (!node) {
    return true
  } else {
    return node.internal.contentDigest !== digest
  }
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
    iterateNodes,
    iterateNodesByType,
    updateDataStore,
    ready,
    hasNodeChanged,

    // deprecated:
    getNodes,
    getNodesByType,
  }
  emitter.on(`*`, action => {
    if (action) {
      updateDataStore(action)
    }
  })
  return lmdbDatastore
}
