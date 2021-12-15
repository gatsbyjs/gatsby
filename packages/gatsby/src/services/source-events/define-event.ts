import { AsyncLocalStorage } from "async_hooks"

import { buildCreateEvent } from "./create-event"
import { EventResult, EventTypes, OnCreateEvent } from "./types"

export type SourceEventHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any, // this is any because the source plugin can pass in anything they want here
  gatsbyApi?: any & { pluginOptions?: any }
) => undefined | EventResult

export interface EventDefinition {
  type: EventTypes
  description: string
  handler: SourceEventHandler
}

type EventContext = { getDefinition: boolean } | any

export interface CreatedEventDefinition {
  definition: EventDefinition
  context: EventContext
}

interface InternalArgs {
  gatsbyApi?: any
  pluginOptions?: any
  onCreateEvent: OnCreateEvent
  eventDefinitions: EventDefinitionsStore
  parentId?: string
  rootEventQueue?: any
}

export type CreateableEventDefinition = (
  context?: EventContext,
  internalArgs?: InternalArgs
) => EventDefinition | CreatedEventDefinition

export type MaybeCreatedEventDefinition =
  | CreatedEventDefinition
  | CreateableEventDefinition

export interface EventDefinitionsStore {
  [eventTypeName: EventTypes]: CreateableEventDefinition
}

export const eventDefinitions: EventDefinitionsStore = {}

const asyncLocalStorage = new AsyncLocalStorage()

export const defineSourceEvent = (
  definition: EventDefinition
): CreateableEventDefinition => {
  if (!definition.type) {
    throw new Error(`Your event is missing a type name.`)
  }

  if (!definition.description) {
    throw new Error(`Please add a description to your event`)
  }

  if (!definition.handler) {
    throw new Error(`Please add a handler to your event`)
  }

  return (context, rootArgs): EventDefinition | CreatedEventDefinition => {
    if (context.getDefinition) {
      return definition
    }

    const isRootEvent = !!rootArgs

    if (!!isRootEvent && !(`gatsbyApi` in rootArgs)) {
      throw new Error(
        `When creating a root event you must provide the gatsbyApi and pluginOptions arguments`
      )
    }

    const parentArgs = asyncLocalStorage.getStore() as InternalArgs

    if (parentArgs && isRootEvent) {
      throw new Error(
        `Adding root event arguments to a nested event is not allowed.`
      )
    }

    if (!parentArgs && !rootArgs) {
      throw new Error(
        `Event ${definition.type} was created improperly. You can only create defined events within other events. Gatsby will create events from your event definitions specified via the exports.defineSourceEvents gatsby-node api and those events can call additional events, but you may not create top-level events yourself.`
      )
    }

    if (rootArgs && !rootArgs.eventDefinitions) {
      throw new Error(
        `A root event was created of the ${definition.type} type but no event definitions were added to the internal args object.`
      )
    }

    const {
      gatsbyApi,
      pluginOptions,
      onCreateEvent,
      eventDefinitions,
      parentId,
      rootEventQueue,
    } = parentArgs || rootArgs

    const id = `${definition.type}-${Date.now()}`

    const { createEvent } = buildCreateEvent({
      eventDefinitions,
      onCreateEvent,
      gatsbyApi,
      pluginOptions,
      id,
      parentId,
      rootEventQueue,
    })

    const nextLocalStorage = {
      parentId: id,
      gatsbyApi,
      pluginOptions,
      eventDefinitions,
      onCreateEvent,
      rootEventQueue,
    }

    asyncLocalStorage.run(nextLocalStorage, () => {
      createEvent({
        definition,
        context,
      })
    })

    return { definition, context }
  }
}
