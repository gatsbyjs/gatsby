import type { GatsbyConfig } from "gatsby"
import debugAdapter from "./debug-adapter"
import { siteDescription, title } from "./constants"

const shouldUseDebugAdapter = process.env.USE_DEBUG_ADAPTER ?? false
const trailingSlash = (process.env.TRAILING_SLASH ||
  `never`) as GatsbyConfig["trailingSlash"]
const pathPrefix = (process.env.PATH_PREFIX ||
  undefined) as GatsbyConfig["pathPrefix"]

let configOverrides: GatsbyConfig = {}

// Should conditionally add debug adapter to config
if (shouldUseDebugAdapter) {
  configOverrides = {
    adapter: debugAdapter(),
  }
}

const config: GatsbyConfig = {
  siteMetadata: {
    title,
    siteDescription,
  },
  trailingSlash,
  pathPrefix,
  plugins: [],
  ...configOverrides,
}

export default config
