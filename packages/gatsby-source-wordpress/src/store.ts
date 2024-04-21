import { type RematchStore, init } from "@rematch/core"
import immerPlugin from "@rematch/immer"
import { enableMapSet } from "immer"
import models, { type IRootModel } from "./models"

import { AsyncLocalStorage } from "async_hooks"
import type { IPluginOptions } from "./models/gatsby-api"
import type { GatsbyNodeApiHelpers } from "./utils/gatsby-types"

export type IGatsbyApiHook = {
  (helpers: GatsbyNodeApiHelpers, pluginOptions: IPluginOptions): Promise<void>
}

export type Store = RematchStore<IRootModel, Record<string, never>>

export type IStoreData = {
  store: Store
  key: string
}

export const asyncLocalStorage = new AsyncLocalStorage<IStoreData>()

const STORE_MAP = new Map<string, Store>()

export function createStore(): Store {
  return init({
    models,
    plugins: [immerPlugin<IRootModel>()],
  })
}

/**
 * Wraps the API hook with the async local storage context
 */

export const wrapApiHook =
  (hook: IGatsbyApiHook): IGatsbyApiHook =>
  async (helpers, pluginOptions) => {
    const typePrefix = pluginOptions.schema?.typePrefix ?? ``

    if (!STORE_MAP.has(typePrefix)) {
      STORE_MAP.set(typePrefix, createStore())
    }

    const store = STORE_MAP.get(typePrefix)

    return asyncLocalStorage.run({ store, key: typePrefix }, async () =>
      hook(helpers, pluginOptions),
    )
  }

enableMapSet()

export const getStore = (): Store => {
  const alsStore = asyncLocalStorage.getStore()
  if (!alsStore) {
    throw new Error(`Store not found`)
  }
  return alsStore.store
}

export function snapshotContext(): () => void {
  const alsStore = asyncLocalStorage.getStore()
  return (): void => {
    return asyncLocalStorage.enterWith(alsStore)
  }
}

export function getPluginKey(): string {
  return asyncLocalStorage.getStore().key
}

export function withPluginKey(str: string): string {
  return `${getPluginKey()}-${str}`
}

export default getStore
