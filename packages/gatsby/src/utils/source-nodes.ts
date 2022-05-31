import path from "path"
import report from "gatsby-cli/lib/reporter"
import { Span } from "opentracing"
import apiRunner from "./api-runner-node"
import { store, emitter } from "../redux"
import { getDataStore, getNode } from "../datastore"
import { actions } from "../redux/actions"
import { IGatsbyState, IGatsbyNode } from "../redux/types"
import type { GatsbyIterable } from "../datastore/common/iterable"
import GatsbyCacheLmdb from "./cache-lmdb"

const { deleteNode } = actions

const nodeOwnerSet = new Set([`default-site-plugin`])
function sampleNodePluginOwners(action): null {
  nodeOwnerSet.add(action.payload.internal.owner)
}

/**
 * Finds the name of all plugins which implement Gatsby APIs that
 * may create nodes, but which have not actually created any nodes.
 */
function discoverPluginsWithoutNodes(storeState: IGatsbyState): Array<string> {
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
function warnForPluginsWithoutNodes(state: IGatsbyState): void {
  const pluginsWithNoNodes = discoverPluginsWithoutNodes(state)

  pluginsWithNoNodes.map(name =>
    report.warn(
      `The ${name} plugin has generated no Gatsby nodes. Do you need it? This could also suggest the plugin is misconfigured.`
    )
  )
}

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

    return !state.nodesTouched.has(rootNode.id)
  })
}

/**
 * Find all stale nodes and delete them
 */
function deleteStaleNodes(
  state: IGatsbyState,
  nodes: GatsbyIterable<IGatsbyNode>
): void {
  const staleNodes = getStaleNodes(state, nodes)

  staleNodes.forEach(node => store.dispatch(deleteNode(node)))
}

let isInitialSourcing = true
let sourcingCount = 0
let decoupledSourcingCache
export default async ({
  webhookBody,
  pluginName,
  parentSpan,
  deferNodeMutation = false,
  rootDir,
}: {
  webhookBody: unknown
  pluginName?: string
  parentSpan?: Span
  deferNodeMutation?: boolean
  rootDir: string
}): Promise<void> => {
  const traceId = isInitialSourcing
    ? `initial-sourceNodes`
    : `sourceNodes #${sourcingCount}`

  const DECOUPLED_SOURCING =
    process.env.DECOUPLED_SOURCING === `true` ||
    process.env.DECOUPLED_SOURCING === `1`
  console.log(`sourcing`)

  // Listen to node creation to record which plugins create nodes.
  // TODO — do we need to handle TOUCH_NODE as well? Or is
  // this warning truely only intersting on an empty cache?
  // Right now it's warning if the cache is warm which isn't what
  // we want.
  //
  // Probably we could store this info in a reducer.
  if (isInitialSourcing) 
    emitter.on(`CREATE_NODE`, sampleNodePluginOwners)
  }

  if (DECOUPLED_SOURCING) {
    console.log(`decoupled sourcing`)
    decoupledSourcingCache =
      decoupledSourcingCache ||
      new GatsbyCacheLmdb({
        name: `ledger-cache`,
        encoding: `string`,
      }).init()

    const sourcerer = require(path.join(rootDir, `decoupled-sourcerer`))
    console.log({ sourcerer })
    console.time(`sourcing time`)
    await sourcerer({ cache: decoupledSourcingCache, store, emitter })
    console.timeEnd(`sourcing time`)

    await apiRunner(`sourceNodes`, {
      traceId,
      waitForCascadingActions: true,
      deferNodeMutation,
      parentSpan,
      webhookBody: {},
      pluginName: `internal-data-bridge`,
    })
  } else {
    console.log(`regular sourcing`)
    await apiRunner(`sourceNodes`, {
      traceId,
      waitForCascadingActions: true,
      deferNodeMutation,
      parentSpan,
      webhookBody: webhookBody || {},
      pluginName,
    })
  }

  console.time(`getDataStore.ready()`)
  await getDataStore().ready()
  console.timeEnd(`getDataStore.ready()`)

  // We only warn for plugins w/o nodes and delete stale nodes on the first sourcing.
  console.time(`other sourcing work`)
  if (isInitialSourcing) {
    const state = store.getState()
    warnForPluginsWithoutNodes(state)

    if (!DECOUPLED_SOURCING) {
      const nodes = getDataStore().iterateNodes()
      deleteStaleNodes(state, nodes)
    }

    isInitialSourcing = false

    emitter.off(`CREATE_NODE`, sampleNodePluginOwners)
  }
  console.timeEnd(`other sourcing work`)

  store.dispatch(actions.apiFinished({ apiName: `sourceNodes` }))

  sourcingCount += 1
}
