import { IAdapterFinalGatsbyConfig, IAdapterManager } from "./types"

export function noOpAdapterManager(): IAdapterManager {
  return {
    restoreCache: (): void => {},
    storeCache: (): void => {},
    adapt: (): void => {},
    config: async (): Promise<IAdapterFinalGatsbyConfig> => {
      return {
        excludeDatastoreFromEngineFunction: false,
      }
    },
  }
}
