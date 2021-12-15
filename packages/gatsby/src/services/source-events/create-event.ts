import { EventDefinitionsStore } from "./define-event"
import { CreateEvent, EventNode, OnCreateEvent } from "./types"

export const buildCreateEvent = ({
  eventDefinitions,
  onCreateEvent,
  gatsbyApi,
  pluginOptions = {},
  id,
  parentId,
  rootEventQueue,
}: {
  id: string
  parentId?: string
  onCreateEvent: OnCreateEvent
  gatsbyApi: any
  pluginOptions: any
  eventDefinitions: EventDefinitionsStore
  rootEventQueue: any
}): {
  createEvent: CreateEvent
} => {
  const createEvent: CreateEvent = async createdEvent => {
    const { context = {}, definition: eventDefinition } = createdEvent

    if (!eventDefinitions[eventDefinition.type]) {
      throw new Error(
        `${eventDefinition.type} was not defined via the exports.defineSourceEvents API.`
      )
    }

    const event: EventNode = {
      id,
      parentId,
      type: eventDefinition.type,
      context: {
        ...context,
        parentId,
      },
    }

    const handler = async (): void => {
      try {
        await eventDefinition.handler(event.context, {
          ...gatsbyApi,
          pluginOptions,
        })

        console.log({ event })
        onCreateEvent?.(event)
      } catch (e: any) {
        gatsbyApi.reporter.panic(
          `Event ${eventDefinition?.type} ${event.id} errored:\n\n${e.stack}\n`
        )
      }
    }

    if (rootEventQueue) {
      rootEventQueue.push({
        handler,
      })
    } else {
      throw new Error(
        `No event queue found when creating a source event of type ${eventDefinition.type}. This is a bug in Gatsby.`
      )
    }
  }

  return { createEvent }
}
