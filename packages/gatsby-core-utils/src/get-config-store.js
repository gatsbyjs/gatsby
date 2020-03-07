import Configstore from "configstore"

let config

module.exports = () => {
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
