import Configstore from "configstore"

let config: Configstore

const getConfigStore = (): Configstore => {
  if (!config) {
    config = new Configstore(
      `gatsby`,
      {},
      {
        globalConfigPath: true,
      }
    )
  }

  return config
}

export default getConfigStore
