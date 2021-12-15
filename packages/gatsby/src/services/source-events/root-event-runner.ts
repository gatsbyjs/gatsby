import { getQueue } from "./event-queue"
import { bindActionCreators } from "redux"
import { getCache } from "../../utils/get-cache"
import { createNodeId } from "../../utils/create-node-id"
import { createContentDigest } from "gatsby-core-utils"
import reporter from "gatsby-cli/lib/reporter"
import { store } from "../../redux"

const availableActionsCache = new Map()

/**
 * This FN creates a root source event by eventType for each plugin which defines that event type
 * @todo need to bring over more logic from api-runner-node. For example the bound actions here don't work because they're not "double bound" with the plugin
 */
export async function rootSourceEventRunner({
  eventType,
  sourceEventDefinitions,
}): Promise<void> {
  const definitions = sourceEventDefinitions.map(
    ({ createableEventDefinition, plugin }) => {
      return {
        createableEventDefinition,
        definition: createableEventDefinition({
          getDefinition: true,
        }),
        plugin,
      }
    }
  )

  const eventDefinitionsByType = definitions.reduce(
    (accumulator, { definition, createableEventDefinition }) => {
      accumulator[definition.type] = createableEventDefinition

      return accumulator
    },
    {}
  )

  const releventDefinitions = definitions?.filter(
    ({ definition }) => definition.type === eventType
  )

  if (!releventDefinitions?.length) {
    return
  }

  const {
    publicActions,
    restrictedActionsAvailableInAPI,
  } = require(`../../redux/actions`)

  await Promise.all(
    releventDefinitions.map(
      async ({ plugin, createableEventDefinition, definition }) => {
        let availableActions

        if (availableActionsCache.has(definition.type)) {
          availableActions = availableActionsCache.get(definition.type)
        } else {
          availableActions = {
            ...publicActions,
            ...(restrictedActionsAvailableInAPI[definition.type] || {}),
          }

          availableActionsCache.set(definition.type, availableActions)
        }

        const { createNode, ...boundActionCreators } = bindActionCreators(
          availableActions,
          store.dispatch
        )

        const cache = getCache(plugin.name)

        const namespacedCreateNodeId = (id: string): string =>
          createNodeId(id, plugin.name)

        // @todo we should have a different queue for each plugin
        // getQueue only returns a single queue
        const rootEventQueue = getQueue<any, unknown>()
        const waitUntilQueueIsIdle = new Promise<void>(resolve => {
          rootEventQueue.drain = (): void => resolve()
        })

        createableEventDefinition(
          {
            // initial event context is empty
            // @todo add last sourcing cache key or timestamp here
          },
          // this object is passed down to each nested event
          {
            eventDefinitions: eventDefinitionsByType,
            gatsbyApi: {
              ...boundActionCreators,
              createNode: node => createNode(node, plugin),
              cache,
              createNodeId: namespacedCreateNodeId,
              createContentDigest,
              reporter, // @todo get local plugin reporter instead
            },
            pluginOptions: plugin.pluginOptions,
            rootEventQueue,
          }
        )

        await waitUntilQueueIsIdle
      }
    )
  )
}
