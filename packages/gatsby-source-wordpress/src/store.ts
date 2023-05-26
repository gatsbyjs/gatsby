import { RematchStore, init } from "@rematch/core"
import immerPlugin from "@rematch/immer"
import models, { IRootModel } from "./models"

import { AsyncLocalStorage } from "async_hooks"
import { IPluginOptions } from "./models/gatsby-api"
import { GatsbyNodeApiHelpers } from "./utils/gatsby-types"

export interface IGatsbyApiHook {
  (helpers: GatsbyNodeApiHelpers, pluginOptions: IPluginOptions): Promise<void>
}

export type Store = RematchStore<IRootModel, Record<string, never>>

export const asyncLocalStorage = new AsyncLocalStorage<Store>()

const STORE_MAP = new Map<string, Store>()

/**
 * Wraps the API hook with the async local storage context
 */

export const wrapApiHook =
  (hook: IGatsbyApiHook): IGatsbyApiHook =>
  async (helpers, pluginOptions) => {
    const typePrefix = pluginOptions.schema?.typePrefix ?? ``
    if (!STORE_MAP.has(typePrefix)) {
      STORE_MAP.set(
        typePrefix,
        init({
          models,
          plugins: [immerPlugin<IRootModel>()],
        })
      )
    }

    const store = STORE_MAP.get(typePrefix)

    return asyncLocalStorage.run(store, async () =>
      hook(helpers, pluginOptions)
    )
  }

const store = (): Store => asyncLocalStorage.getStore()

export default store
