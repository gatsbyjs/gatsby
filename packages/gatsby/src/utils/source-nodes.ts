import report from "gatsby-cli/lib/reporter"
import { Span } from "opentracing"
import apiRunner from "./api-runner-node"
import { store, emitter } from "../redux"
import { getDataStore, getNode, getNodes } from "../datastore"
import { actions } from "../redux/actions"
import { IGatsbyState } from "../redux/types"
const { deleteNode } = actions
import { Node } from "../../index"

/**
 * Finds the name of all plugins which implement Gatsby APIs that
 * may create nodes, but which have not actually created any nodes.
 */
function discoverPluginsWithoutNodes(
  storeState: IGatsbyState,
  nodes: Array<Node>
): Array<string> {
  // Find out which plugins own already created nodes
  const nodeOwnerSet = new Set([`default-site-plugin`])
  nodes.forEach(node => nodeOwnerSet.add(node.internal.owner))

  return storeState.flattenedPlugins
    .filter(
      plugin =>
        // "Can generate nodes"
        plugin.nodeAPIs.includes(`sourceNodes`) &&
        // "Has not generated nodes"
        !nodeOwnerSet.has(plugin.name)
    )
    .map(plugin => plugin.name)
}

/**
 * Warn about plugins that should have created nodes but didn't.
 */
function warnForPluginsWithoutNodes(
  state: IGatsbyState,
  nodes: Array<Node>
): void {
  const pluginsWithNoNodes = discoverPluginsWithoutNodes(state, nodes)

  pluginsWithNoNodes.map(name =>
    report.warn(
      `The ${name} plugin has generated no Gatsby nodes. Do you need it?`
    )
  )
}

/**
 * Return the set of nodes for which its root node has not been touched
 */
function getStaleNodes(state: IGatsbyState, nodes: Array<Node>): Array<Node> {
  return nodes.filter(node => {
    let rootNode = node
    let next: Node | undefined = undefined

    let whileCount = 0
    do {
      next = rootNode.parent ? getNode(rootNode.parent) : undefined
      if (next) {
        rootNode = next
      }
    } while (next && ++whileCount < 101)

    if (whileCount > 100) {
      console.log(
        `It looks like you have a node that's set its parent as itself`,
        rootNode
      )
    }

    return !state.nodesTouched.has(rootNode.id)
  })
}

/**
 * Find all stale nodes and delete them
 */
function deleteStaleNodes(state: IGatsbyState, nodes: Array<Node>): void {
  const staleNodes = getStaleNodes(state, nodes)

  if (staleNodes.length > 0) {
    staleNodes.forEach(node => store.dispatch(deleteNode(node)))
  }
}

let initialSourcing = true
let sourcingCount = 0
const changedNodes = {
  deleted: new Map(),
  created: new Map(),
  updated: new Map(),
}

emitter.on(`DELETE_NODE`, action => {
  if (action.payload?.id) {
    changedNodes.deleted.set(action.payload.id, { node: action.payload })
  }
})

emitter.on(`CREATE_NODE`, action => {
  // If this node was deleted before being recreated, remove it from the deleted node
  // list
  changedNodes.deleted.delete(action.payload.id)

  if (action.oldNode?.id) {
    changedNodes.updated.set(action.payload.id, {
      oldNode: action.oldNode,
      node: action.payload,
    })
  } else {
    changedNodes.created.set(action.payload.id, { node: action.payload })
  }
})

export default async ({
  webhookBody,
  pluginName,
  parentSpan,
  deferNodeMutation = false,
}: {
  webhookBody: unknown
  pluginName?: string
  parentSpan?: Span
  deferNodeMutation?: boolean
}): Promise<void> => {
  console.time(`sourceNodes`)
  // Clear changedNodes maps
  changedNodes.deleted.clear()
  changedNodes.created.clear()
  changedNodes.updated.clear()

  const traceId = initialSourcing
    ? `initial-sourceNodes`
    : `sourceNodes #${sourcingCount}`

  await apiRunner(`sourceNodes`, {
    traceId,
    waitForCascadingActions: true,
    deferNodeMutation,
    parentSpan,
    webhookBody: webhookBody || {},
    pluginName,
  })
  console.timeEnd(`sourceNodes`)

  sourcingCount += 1

  console.time(`sourceNodes: await dataStore`)
  await getDataStore().ready()
  console.timeEnd(`sourceNodes: await dataStore`)
  console.log({ initialSourcing })

  console.log(changedNodes)
  store.dispatch({
    type: `SET_CHANGED_NODES`,
    payload: changedNodes,
  })

  if (initialSourcing) {
    console.time(`sourceNodes: delete stale nodes`)
    const state = store.getState()
    const nodes = getNodes()

    warnForPluginsWithoutNodes(state, nodes)

    deleteStaleNodes(state, nodes)
    initialSourcing = false
    console.timeEnd(`sourceNodes: delete stale nodes`)
  } else {
    return
  }
}
