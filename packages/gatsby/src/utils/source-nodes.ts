import report from "gatsby-cli/lib/reporter"
import { Span } from "opentracing"
import { sourceNodesApiRunner } from "./source-nodes-api-runner"
import { store } from "../redux"
import { getDataStore, getNode } from "../datastore"
import { actions } from "../redux/actions"
import { IGatsbyState, IGatsbyNode } from "../redux/types"
import type { GatsbyIterable } from "../datastore/common/iterable"

const { deleteNode } = actions

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

    if (state.statefulSourcePlugins.has(rootNode.internal.owner)) {
      return false
    }

    return !state.nodesTouched.has(rootNode.id)
  })
}

/**
 * Find all stale nodes and delete them unless the node type has been opted out of stale node garbage collection.
 */
async function deleteStaleNodes(
  previouslyExistingNodeTypeNames: Array<string>
): Promise<void> {
  const state = store.getState()

  let deleteCount = 0

  const cleanupStaleNodesActivity =
    report.createProgress(`Clean up stale nodes`)

  cleanupStaleNodesActivity.start()

  const { pluginNamesToOwnedNodeTypes, statefulSourcePlugins } = state

  const typeNamesToOwnerPluginName = new Map()

  pluginNamesToOwnedNodeTypes.forEach((ownedTypes, pluginName) => {
    ownedTypes.forEach(typeName => {
      typeNamesToOwnerPluginName.set(typeName, pluginName)
    })
  })

  for (const typeName of previouslyExistingNodeTypeNames) {
    const pluginName = typeNamesToOwnerPluginName.get(typeName)

    // no need to check this type if its owner has declared its a stateful source plugin
    if (pluginName && statefulSourcePlugins.has(pluginName)) {
      continue
    }

    report.verbose(`Checking for stale ${typeName} nodes`)

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

let isInitialSourceNodesOfCurrentNodeProcess = true
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
  const traceId = isInitialSourceNodesOfCurrentNodeProcess
    ? `initial-sourceNodes`
    : `sourceNodes #${sourcingCount}`

  await getDataStore().ready()

  const previouslyExistingNodeTypeNames: Array<string> = []

  for (const typeName of getDataStore().getTypes()) {
    previouslyExistingNodeTypeNames.push(typeName)
  }

  await sourceNodesApiRunner({
    traceId,
    deferNodeMutation,
    parentSpan,
    webhookBody,
    pluginName,
  })

  await getDataStore().ready()

  // We only warn for plugins w/o nodes and delete stale nodes on the first sourceNodes call of the current process.
  if (isInitialSourceNodesOfCurrentNodeProcess) {
    isInitialSourceNodesOfCurrentNodeProcess = false

    if (
      // if this is the very first source and no types existed before this sourceNodes run, there's no need to check for stale nodes. They wont be stale because they were just created. Only check for stale nodes in node types that never existed before.
      previouslyExistingNodeTypeNames.length > 0
    ) {
      await deleteStaleNodes(previouslyExistingNodeTypeNames)
    }
  }

  store.dispatch(actions.apiFinished({ apiName: `sourceNodes` }))

  sourcingCount += 1
}
