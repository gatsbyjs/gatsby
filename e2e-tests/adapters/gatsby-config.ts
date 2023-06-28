import type { GatsbyConfig } from "gatsby"
import debugAdapter from "./debug-adapter"
import { siteDescription, title } from "./constants"

const shouldUseDebugAdapter = process.env.USE_DEBUG_ADAPTER ?? false

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
  trailingSlash: "never",
  plugins: [],
  ...configOverrides,
}

export default config
