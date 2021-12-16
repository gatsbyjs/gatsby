// We want to add private fields to our implementation so outside users can't mess with them
export const SYMBOL_PLUGIN = Symbol(`plugin`)
export const SYMBOL_MANAGER = Symbol(`taskManager`)
export const SYMBOL_TYPE = Symbol(`type`)

export type EventType = string

export interface IPlugin {
  id: string
  name: string
  pluginOptions: Record<string, unknown>
}

interface ICreateNodeArgs {
  id: string
  type: string
  contentDigest: string
  fields: Record<string, unknown>
}

interface IDeleteNodeArgs {
  id: string
}

export interface IEventActions {
  createNode: (args: ICreateNodeArgs) => void
  deleteNode: (args: IDeleteNodeArgs) => void
  createContentDigest: (content: unknown) => string
  createNodeId: (id: string) => string
}

type EventHandlerFn<T, U> = (args: U) => Promise<T>

export type EventHandlerArg<T, U> = (
  context: U,
  actions: IEventActions & {
    pluginOptions: IPlugin["pluginOptions"]
  }
) => T

export type EventHandler<T, U> = EventHandlerFn<T, U> & {
  [SYMBOL_TYPE]: EventType
  [SYMBOL_PLUGIN]?: IPlugin
  [SYMBOL_MANAGER]?: IManager
}

export interface IManager {
  register: <T, U>(event: EventHandler<T, U>, plugin: IPlugin) => void
  queue: <T, U>(task: ITask<T, U>) => Promise<T>
}

export interface ITask<T, U> {
  type: EventHandler<T, U>[typeof SYMBOL_TYPE]
  handler: EventHandlerArg<T, U>
  args: U
  plugin: EventHandler<T, U>[typeof SYMBOL_PLUGIN]
}
