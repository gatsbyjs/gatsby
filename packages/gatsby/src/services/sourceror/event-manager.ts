import { uuid } from "gatsby-core-utils"
import { SYMBOL_PLUGIN, SYMBOL_MANAGER } from "./types"
import { AsyncLocalStorage } from "async_hooks"

import type {
  IManager,
  IPlugin,
  ITask,
  EventHandler,
  IEventActions,
} from "./types"

export class EventManager implements IManager {
  private asyncStorage: AsyncLocalStorage<string>
  private actions: IEventActions

  constructor(actions: IEventActions) {
    this.asyncStorage = new AsyncLocalStorage()
    this.actions = actions
  }

  register<T, U>(handler: EventHandler<T, U>, plugin: IPlugin): void {
    handler[SYMBOL_PLUGIN] = plugin
    handler[SYMBOL_MANAGER] = this
  }

  async queue<T, U>({ type, handler, args, plugin }: ITask<T, U>): Promise<T> {
    if (!plugin) {
      throw new Error(`Plugin not found for task`)
    }

    const parent: string | undefined = this.asyncStorage.getStore()

    return new Promise(resolve => {
      this.asyncStorage.run(`${type}-${uuid.v4()}`, () =>
        setImmediate(() => {
          if (parent) {
            // Tracking???
          }

          const result = handler(args, {
            ...this.actions,
            pluginOptions: plugin.pluginOptions,
          })

          resolve(result)
        })
      )
    })
  }
}
