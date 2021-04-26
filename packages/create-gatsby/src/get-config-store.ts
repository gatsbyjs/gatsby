import Configstore from "configstore"

let config: Configstore
/**
 * Copied from gatsby-core-utils to avoid depending on it
 * Gets the configstore instance related to gatsby
 * @return the ConfigStore instance for gatsby
 */

export const getConfigStore = (): Configstore => {
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
