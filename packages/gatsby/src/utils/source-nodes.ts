import report from "gatsby-cli/lib/reporter"
import { Span } from "opentracing"
import { sourceNodesApiRunner } from "./source-nodes-api-runner"
import { store } from "../redux"
import { getDataStore, getNode } from "../datastore"
import { actions } from "../redux/actions"
import { IGatsbyState, IGatsbyNode } from "../redux/types"
import type { GatsbyIterable } from "../datastore/common/iterable"

const { deleteNode } = actions

// console.log(`ya`, nodeOwnerSet.keys())
// /**
//  * Finds the name of all plugins which implement Gatsby APIs that
//  * may create nodes, but which have not actually created any nodes.
//  * owners are added to nodeOwnerSet from within the createNode action
//  */
// function discoverPluginsWithoutNodes(storeState: IGatsbyState): Array<string> {
//   return storeState.flattenedPlugins
//     .filter(
//       plugin =>
//         // "Can generate nodes"
//         plugin.nodeAPIs.includes(`sourceNodes`) &&
//         // "Has not generated nodes"
//         !nodeOwnerSet.has(plugin.name)
//     )
//     .map(plugin => plugin.name)
// }

/**
 * Warn about plugins that should have created nodes but didn't.
 */
// function warnForPluginsWithoutNodes(state: IGatsbyState): void {
//   console.log(`ya2`, nodeOwnerSet.keys())
//   const pluginsWithNoNodes = discoverPluginsWithoutNodes(state)

//   pluginsWithNoNodes.map(name =>
//     report.warn(
//       `The ${name} plugin has generated no Gatsby nodes. Do you need it? This could also suggest the plugin is misconfigured.`
//     )
//   )
// }

/**
 * Return the set of nodes for which its root node has not been touched
 */
function getStaleNodes(
  state: IGatsbyState,
  nodes: GatsbyIterable<IGatsbyNode>
): GatsbyIterable<IGatsbyNode> {
  return nodes.filter(node => {
    let rootNode = node
    let next: IGatsbyNode | undefined = undefined

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

    if (state.touchNodeOptOutTypes.has(rootNode.internal.type)) {
      return false
    }

    return !state.nodesTouched.has(rootNode.id)
  })
}

/**
 * Find all stale nodes and delete them
 */
async function deleteStaleNodes(state: IGatsbyState): Promise<void> {
  let deleteCount = 0

  const cleanupStaleNodesActivity =
    report.createProgress(`clean up stale nodes`)
  cleanupStaleNodesActivity.start()

  for (const typeName of getDataStore().getTypes()) {
    if (state.touchNodeOptOutTypes.has(typeName)) {
      continue
    }

    report.info(`checking for ${typeName} nodes to delete`)

    const nodes = getDataStore().iterateNodesByType(typeName)
    const staleNodes = getStaleNodes(state, nodes)

    for (const node of staleNodes) {
      store.dispatch(deleteNode(node))
      cleanupStaleNodesActivity.tick()

      if (++deleteCount % 5000) {
        // dont block event loop
        await new Promise(res => {
          setImmediate(() => {
            res(null)
          })
        })
      }
    }
  }

  cleanupStaleNodesActivity.end()
}

let isInitialSourcing = true
let sourcingCount = 0
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
  const traceId = isInitialSourcing
    ? `initial-sourceNodes`
    : `sourceNodes #${sourcingCount}`
  await sourceNodesApiRunner({
    traceId,
    deferNodeMutation,
    parentSpan,
    webhookBody,
    pluginName,
  })

  await getDataStore().ready()

  // We only warn for plugins w/o nodes and delete stale nodes on the first sourcing.
  if (isInitialSourcing) {
    const state = store.getState()

    await deleteStaleNodes(state)
    // warnForPluginsWithoutNodes(state)

    isInitialSourcing = false
  }

  store.dispatch(actions.apiFinished({ apiName: `sourceNodes` }))

  sourcingCount += 1
}
