import { CreatedEventDefinition, EventDefinition } from "./define-event"

export type EventContext = any
export type EventResult = any

export type EventTypes =
  | `DefineQueries`
  | `SourceAll`
  | `SourceChanged`
  | `FetchDataPage`
  | `GraphQLRequest`
  | `FetchFile`
  | string

export interface EventNode {
  id: string
  parentId?: string
  type: EventTypes
  context: EventContext
}

export type CreateEvent = (
  event: CreatedEventDefinition,
  additionalContext?: any
) => void

export type OnCreateEvent = (event: EventNode) => Promise<void>

export interface DefinedEventsHelper {
  [eventType: EventTypes]: (args?: { context: EventContext }) => EventDefinition
}

export interface SourceEventsArgs {
  lastSourceEventsTime: null | {
    start?: number
    end?: number
  }
  createEvent: CreateEvent
  isPreview: boolean
}
