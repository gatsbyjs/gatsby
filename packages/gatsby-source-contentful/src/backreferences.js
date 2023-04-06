// @ts-check
import { hasFeature } from "gatsby-plugin-utils/index"
import { getDataStore } from "gatsby/dist/datastore"
import { untilNextEventLoopTick } from "./utils"

// Array of all existing Contentful nodes. Make it global and incrementally update it because it's hella slow to recreate this on every data update for large sites.
const existingNodes = new Map()

let allNodesLoopCount = 0
let isFirstSourceNodesCallOfCurrentNodeProcess = true

export async function getExistingCachedNodes({
  actions,
  getNode,
  pluginConfig,
}) {
  const { enableStatefulSourceNodes, touchNode } = actions

  const hasStatefulSourceNodes = hasFeature(`stateful-source-nodes`)

  if (hasStatefulSourceNodes) {
    enableStatefulSourceNodes()
  }

  const needToTouchNodes =
    !hasStatefulSourceNodes && isFirstSourceNodesCallOfCurrentNodeProcess

  if (existingNodes.size === 0) {
    const dataStore = getDataStore()
    const allNodeTypeNames = Array.from(dataStore.getTypes())

    for (const typeName of allNodeTypeNames) {
      const typeNodes = dataStore.iterateNodesByType(typeName)

      const firstNodeOfType = Array.from(typeNodes.slice(0, 1))[0]

      if (
        !firstNodeOfType ||
        firstNodeOfType.internal.owner !== `gatsby-source-contentful`
      ) {
        continue
      }

      for (const node of typeNodes) {
        if (needToTouchNodes) {
          touchNode(node)

          if (node?.fields?.includes(`localFile`)) {
            // Prevent GraphQL type inference from crashing on this property
            const fullNode = getNode(node.id)
            const localFileNode = getNode(fullNode.fields.localFile)
            touchNode(localFileNode)
          }
        }

        if (++allNodesLoopCount % 5000 === 0) {
          // dont block the event loop
          await untilNextEventLoopTick()
        }

        if (
          pluginConfig.get(`enableTags`) &&
          node.internal.type === `ContentfulTag`
        ) {
          continue
        }

        addNodeToExistingNodesCache(node)
      }

      // dont block the event loop
      await untilNextEventLoopTick()
    }
  }

  isFirstSourceNodesCallOfCurrentNodeProcess = false

  return existingNodes
}

// store only the fields we need to compare to reduce memory usage. if a node is updated we'll use getNode to grab the whole node before updating it
export function addNodeToExistingNodesCache(node) {
  const cacheNode = {
    id: node.id,
    contentful_id: node.contentful_id,
    sys: {
      type: node.sys.type,
    },
    node_locale: node.node_locale,
    children: node.children,
    internal: {
      owner: node.internal.owner,
    },
    __memcache: true,
  }

  for (const key of Object.keys(node)) {
    if (key.endsWith(`___NODE`)) {
      cacheNode[key] = node[key]
    }
  }

  existingNodes.set(node.id, cacheNode)
}

export function removeNodeFromExistingNodesCache(node) {
  existingNodes.delete(node.id)
}
