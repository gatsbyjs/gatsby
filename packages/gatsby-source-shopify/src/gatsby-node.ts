import { NodePluginArgs } from "gatsby"

import { ERROR_MAP } from "./error-map"

export { sourceNodes } from "./source-nodes"
export { createResolvers } from "./create-resolvers"
export { pluginOptionsSchema } from "./plugin-options-schema"
export { createSchemaCustomization } from "./create-schema-customization"

const initializePlugin = ({ reporter }: NodePluginArgs): void => {
  reporter.setErrorMap(ERROR_MAP)
}

let coreSupportsOnPluginInit: `unstable` | `stable` | undefined

try {
  const { isGatsbyNodeLifecycleSupported } = require(`gatsby-plugin-utils`)
  if (isGatsbyNodeLifecycleSupported(`onPluginInit`)) {
    coreSupportsOnPluginInit = `stable`
  } else if (isGatsbyNodeLifecycleSupported(`unstable_onPluginInit`)) {
    coreSupportsOnPluginInit = `unstable`
  }
} catch (e) {
  console.error(`Could not check if Gatsby supports onPluginInit lifecycle`)
}

if (coreSupportsOnPluginInit === `unstable`) {
  // need to conditionally export otherwise it throws an error for older versions
  exports.unstable_onPluginInit = initializePlugin
} else if (coreSupportsOnPluginInit === `stable`) {
  exports.onPluginInit = initializePlugin
} else {
  exports.onPreInit = initializePlugin
}
