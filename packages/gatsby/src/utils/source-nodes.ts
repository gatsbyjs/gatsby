import report from "gatsby-cli/lib/reporter"
import { Span } from "opentracing"
import apiRunner from "./api-runner-node"
import { store } from "../redux"
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
  for (let i = 0; i < nodes.length; i++) {
    nodeOwnerSet.add(nodes[i].internal.owner)
  }
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
 * as well as plugins which define sourceNodes but didn't create any nodes.
 */
function checkNodes(
  state: IGatsbyState,
  nodes: Array<Node>
): Array<Array<Node> | Array<string>> {
  const staleNodes: Array<Node> = []
  const nodeOwnerSet = new Set([`default-site-plugin`])
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    nodeOwnerSet.add(node.internal.owner)

    // if (node.internal.owner === `gatsby-source-drupal`) {
    // continue
    // }
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

    if (!state.nodesTouched.has(rootNode.id)) {
      staleNodes.push(node)
    }
  }

  const noNodesPlugins = state.flattenedPlugins
    .filter(
      plugin =>
        // "Can generate nodes"
        plugin.nodeAPIs.includes(`sourceNodes`) &&
        // "Has not generated nodes"
        !nodeOwnerSet.has(plugin.name)
    )
    .map(plugin => plugin.name)

  return [staleNodes, noNodesPlugins]
}

/**
 * Find all stale nodes and delete them
 */
function validateAndGCNodes(state: IGatsbyState, nodes: Array<Node>): void {
  const [staleNodes, pluginsWithNoNodes] = checkNodes(state, nodes)

  if (staleNodes.length > 0) {
    staleNodes.forEach(node => store.dispatch(deleteNode(node)))
  }

  pluginsWithNoNodes.map(name =>
    report.warn(
      `The ${name} plugin has generated no Gatsby nodes. Do you need it?`
    )
  )
}

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
  await apiRunner(`sourceNodes`, {
    traceId: `initial-sourceNodes`,
    waitForCascadingActions: true,
    deferNodeMutation,
    parentSpan,
    webhookBody: webhookBody || {},
    pluginName,
  })
  await getDataStore().ready()

  const state = store.getState()
  const nodes = getNodes()

  validateAndGCNodes(state, nodes)
}
