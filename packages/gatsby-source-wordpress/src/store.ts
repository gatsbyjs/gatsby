import { RematchStore, init } from "@rematch/core"
import immerPlugin from "@rematch/immer"
import { enableMapSet } from "immer"
import models, { IRootModel } from "./models"

import { AsyncLocalStorage } from "async_hooks"
import { IPluginOptions } from "./models/gatsby-api"
import { GatsbyNodeApiHelpers } from "./utils/gatsby-types"

export interface IGatsbyApiHook {
  (helpers: GatsbyNodeApiHelpers, pluginOptions: IPluginOptions): Promise<void>
}

export type Store = RematchStore<IRootModel, Record<string, never>>

export interface IStoreData {
  store: Store
  key: string
}

export const asyncLocalStorage = new AsyncLocalStorage<IStoreData>()

const STORE_MAP = new Map<string, Store>()

export const createStore = (): Store =>
  init({
    models,
    plugins: [immerPlugin<IRootModel>()],
  })

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
      hook(helpers, pluginOptions)
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

export const snapshotContext = (): (() => void) => {
  const alsStore = asyncLocalStorage.getStore()
  return (): void => asyncLocalStorage.enterWith(alsStore)
}

export const getPluginKey = (): string => asyncLocalStorage.getStore().key

export const withPluginKey = (str: string): string => `${getPluginKey()}-${str}`

export default getStore
