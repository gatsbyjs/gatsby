import { IAdapterFinalConfig, IAdapterManager } from "./types"

export function noOpAdapterManager(): IAdapterManager {
  return {
    restoreCache: (): void => {},
    storeCache: (): void => {},
    adapt: (): void => {},
    config: async (): Promise<IAdapterFinalConfig> => {
      return {
        excludeDatastoreFromEngineFunction: false,
        pluginsToDisable: [],
      }
    },
  }
}
