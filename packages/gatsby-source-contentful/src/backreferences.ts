import { hasFeature } from "gatsby-plugin-utils/index"
import { untilNextEventLoopTick } from "./utils"
import type { IContentfulEntry } from "./types/contentful"

// @ts-ignore this is not available (yet) in typegen phase
import { getDataStore } from "gatsby/dist/datastore"
// @ts-ignore this is not available (yet) in typegen phase
import type { IGatsbyNode } from "gatsby/dist/redux/types"
import type { Actions, Node, NodePluginArgs } from "gatsby"
import type { IProcessedPluginOptions } from "./types/plugin"

// Array of all existing Contentful nodes. Make it global and incrementally update it because it's hella slow to recreate this on every data update for large sites.
export const existingNodes = new Map<string, IContentfulEntry>()

let allNodesLoopCount = 0

// "is" === object so it can be overridden by tests
export const is = {
  firstSourceNodesCallOfCurrentNodeProcess: true,
}

interface IMemoryNodesCountsBySysType {
  Asset: number
  Entry: number
}

const memoryNodeCountsBySysType: IMemoryNodesCountsBySysType = {
  Asset: 0,
  Entry: 0,
}

export async function getExistingCachedNodes({
  actions,
  getNode,
  pluginConfig,
}: {
  actions: Actions
  getNode: NodePluginArgs["getNode"]
  pluginConfig: IProcessedPluginOptions
}): Promise<{
  existingNodes: Map<string, IContentfulEntry>
  memoryNodeCountsBySysType: IMemoryNodesCountsBySysType
}> {
  const { touchNode } = actions

  const needToTouchNodes =
    !hasFeature(`stateful-source-nodes`) &&
    is.firstSourceNodesCallOfCurrentNodeProcess

  const needToTouchLocalFileNodes = pluginConfig.get(`downloadLocal`)

  if (existingNodes.size === 0) {
    memoryNodeCountsBySysType.Asset = 0
    memoryNodeCountsBySysType.Entry = 0

    const dataStore = getDataStore()
    const allNodeTypeNames = Array.from(dataStore.getTypes())

    for (const typeName of allNodeTypeNames) {
      const typeNodes = dataStore.iterateNodesByType(typeName)

      const firstNodeOfType = Array.from(
        typeNodes.slice(0, 1)
      )[0] as unknown as IGatsbyNode

      if (
        !firstNodeOfType ||
        firstNodeOfType.internal.owner !== `gatsby-source-contentful`
      ) {
        continue
      }

      for (const node of typeNodes) {
        if (needToTouchNodes) {
          touchNode(node)
        }
        // Handle nodes created by downloadLocal
        if (
          needToTouchLocalFileNodes &&
          node?.fields &&
          Object.keys(node?.fields).includes(`localFile`)
        ) {
          // Prevent GraphQL type inference from crashing on this property
          interface INodeWithLocalFile extends Node {
            fields: {
              localFile: string
              [key: string]: unknown
            }
          }
          const fullNode = getNode(node.id)
          if (fullNode) {
            const localFileFullNode = fullNode as INodeWithLocalFile
            const localFileNode = getNode(localFileFullNode.fields.localFile)
            if (localFileNode) {
              touchNode(localFileNode)
            }
          }
        }

        if (++allNodesLoopCount % 5000 === 0) {
          // dont block the event loop
          await untilNextEventLoopTick()
        }

        addNodeToExistingNodesCache(node as unknown as IContentfulEntry)
      }

      // dont block the event loop
      await untilNextEventLoopTick()
    }
  }

  is.firstSourceNodesCallOfCurrentNodeProcess = false

  return {
    existingNodes,
    memoryNodeCountsBySysType,
  }
}

// store only the fields we need to compare to reduce memory usage. if a node is updated we'll use getNode to grab the whole node before updating it
export function addNodeToExistingNodesCache(node: IContentfulEntry): void {
  if (!node.sys?.type) {
    return
  }

  if (
    node.sys.type in memoryNodeCountsBySysType &&
    !existingNodes.has(node.id)
  ) {
    memoryNodeCountsBySysType[node.sys.type] ||= 0
    memoryNodeCountsBySysType[node.sys.type]++
  }

  const cacheNode = {
    id: node.id,
    sys: {
      id: node.sys.id,
      type: node.sys.type,
      locale: node.sys.locale,
      spaceId: node.sys.spaceId,
    },
    node_locale: node.node_locale,
    children: node.children,
    internal: {
      owner: `gatsby-source-contentful`,
    },
    linkedFrom: node.linkedFrom,
    __memcache: true,
  }

  for (const key of Object.keys(node)) {
    if (key.endsWith(`___NODE`)) {
      cacheNode[key] = node[key]
    }
  }

  existingNodes.set(node.id, cacheNode as unknown as IContentfulEntry)
}

export function removeNodeFromExistingNodesCache(node: IContentfulEntry): void {
  if (node.internal.type === `ContentfulTag`) {
    return
  }

  if (
    node.sys.type in memoryNodeCountsBySysType &&
    existingNodes.has(node.id)
  ) {
    memoryNodeCountsBySysType[node.sys.type] ||= 0
    memoryNodeCountsBySysType[node.sys.type]--

    if (memoryNodeCountsBySysType[node.sys.type] < 0) {
      memoryNodeCountsBySysType[node.sys.type] = 0
    }
  }

  existingNodes.delete(node.id)
}
