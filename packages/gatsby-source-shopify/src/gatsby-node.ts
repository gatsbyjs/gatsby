import type { GatsbyNode } from "gatsby"
import { ERROR_MAP } from "./error-map"

export { sourceNodes } from "./source-nodes"
export { createResolvers } from "./create-resolvers"
export { pluginOptionsSchema } from "./plugin-options-schema"
export { createSchemaCustomization } from "./create-schema-customization"

export const onPluginInit: GatsbyNode["onPluginInit"] = ({
  reporter,
}): void => {
  reporter.setErrorMap(ERROR_MAP)
}
