import { SYMBOL_PLUGIN, SYMBOL_MANAGER, SYMBOL_TYPE } from "./types"
import type { EventHandler, EventType, EventHandlerArg } from "./types"

interface ISourceEventArgs<T, U> {
  type: EventType
  description: string
  meta?: Record<string, unknown>
  handler: EventHandlerArg<T, U>
}

function wrapHandlerWithEventTracking<T, U>({
  type,
  handler,
}: ISourceEventArgs<T, U>): EventHandler<T, U> {
  async function wrappedFunction(args: U): Promise<T> {
    return wrappedFunction[SYMBOL_MANAGER].queue<T, U>({
      type,
      handler,
      args,
      plugin: wrappedFunction[SYMBOL_PLUGIN],
    })
  }

  wrappedFunction[SYMBOL_TYPE] = type

  return wrappedFunction as unknown as EventHandler<T, U>
}

export function defineSourceEvent<T, U>(
  definition: ISourceEventArgs<T, U>
): EventHandler<T, U> {
  if (!definition.type) {
    throw new Error(`Your event is missing a type name.`)
  }

  if (!definition.description) {
    throw new Error(`Please add a description to your event`)
  }

  if (!definition.handler) {
    throw new Error(`Please add a handler to your event`)
  }

  return wrapHandlerWithEventTracking<T, U>(definition)
}
