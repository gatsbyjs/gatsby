import setGatsbyApiToState from "./set-gatsby-api-to-state"
import ensurePluginRequirementsAreMet from "./check-plugin-requirements"
import ingestRemoteSchema from "./ingest-remote-schema"
import persistCachedImages from "./persist-cached-images"

const startupSteps = [
  ensurePluginRequirementsAreMet,
  ingestRemoteSchema,
  persistCachedImages,
]

const onPreBootstrap = async (helpers, pluginOptions) => {
  setGatsbyApiToState(helpers, pluginOptions)

  for (const startupStep of startupSteps) {
    await startupStep()
  }
}

export default onPreBootstrap
