import report from "gatsby-cli/lib/reporter"
import { Span } from "opentracing"
import apiRunner from "./api-runner-node"
import { store, emitter } from "../redux"
import { getDataStore, getNode } from "../datastore"
import { actions } from "../redux/actions"
import { IGatsbyState, IGatsbyNode } from "../redux/types"
import type { GatsbyIterable } from "../datastore/common/iterable"
import got from "got"
import GatsbyCacheLmdb from "./cache-lmdb"

const { chain } = require(`stream-chain`)
const { parser } = require(`stream-json`)
const { streamValues } = require(`stream-json/streamers/StreamValues`)

const { deleteNode } = actions

let cache
/**
 * Finds the name of all plugins which implement Gatsby APIs that
 * may create nodes, but which have not actually created any nodes.
 */
function discoverPluginsWithoutNodes(
  storeState: IGatsbyState,
  nodes: GatsbyIterable<IGatsbyNode>
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
  nodes: GatsbyIterable<IGatsbyNode>
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

  const definitelyLocallySourcedPlugins = [
    `gatsby-source-filesystem`,
    `gatsby-source-git`,
    `internal-data-bridge`,
  ]

  if (
    process.env.DECOUPLED_SOURCING === `true` &&
    process.env.GATSBY_CLOUD_DATALAYER &&
    !definitelyLocallySourcedPlugins.includes(pluginName || ``)
  ) {
    console.log(`Decoupled sourcing running`)

    cache =
      cache ||
      new GatsbyCacheLmdb({
        name: `ledger-cache`,
        encoding: `string`,
      }).init()

    const previousVersionId = (await cache.get(`previousVersionId`)) || 0

    if (!process.env.GATSBY_CLOUD_DATALAYER) {
      throw new Error(
        `A process.env.GATSBY_CLOUD_DATALAYER is required when using decoupled sourcing`
      )
    }

    const url = String(process.env.GATSBY_CLOUD_DATALAYER)

    const versionHeaderKey = `x-sourcerer-versionid`

    const httpStream = got.stream(url, {
      headers: {
        versionHeaderKey: previousVersionId,
      },
    })

    let versionId
    httpStream.on(`response`, response => {
      versionId = response.headers[versionHeaderKey]

      if (versionId) {
        cache.set(`previousVersionId`, versionId)
      }
    })

    console.log({
      url,
      previousVersionId,
      versionId,
    })

    let counter = 0
    const pipeline = chain([
      httpStream,
      parser({ jsonStreaming: true }),
      streamValues(),
      (entry: any): void => {
        counter++
        const action = {
          type: entry.value.type,
          payload: entry.value.payload,
        }

        store.dispatch(action)
        emitter.emit(action.type, action)
      },
    ])

    // this is needed for chain to start running, but we don't need the line by line data that comes back here. We're grabbing JSON objects above
    pipeline.on(`data`, () => {})

    await new Promise(res => {
      pipeline.on(`end`, () => {
        console.log(
          `Done! versionId is: ${versionId}. Applied ${counter} actions.`
        )
        res(null)
      })
    })

    await apiRunner(`sourceNodes`, {
      traceId,
      waitForCascadingActions: true,
      deferNodeMutation,
      parentSpan,
      webhookBody: {},
      pluginName: `internal-data-bridge`,
    })

    console.log(`DONE with decoupled sourcing`)
  } else {
    await apiRunner(`sourceNodes`, {
      traceId,
      waitForCascadingActions: true,
      deferNodeMutation,
      parentSpan,
      webhookBody: webhookBody || {},
      pluginName,
    })
  }

  await getDataStore().ready()

  // We only warn for plugins w/o nodes and delete stale nodes on the first sourcing.
  if (isInitialSourcing) {
    const state = store.getState()
    const nodes = getDataStore().iterateNodes()

    warnForPluginsWithoutNodes(state, nodes)

    deleteStaleNodes(state, nodes)
    isInitialSourcing = false
  }

  store.dispatch(actions.apiFinished({ apiName: `sourceNodes` }))

  sourcingCount += 1
}
