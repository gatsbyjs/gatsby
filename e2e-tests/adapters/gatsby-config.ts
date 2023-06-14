import type { GatsbyConfig } from "gatsby"
import debugAdapter from "./debug-adapter"

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
    title: `adapters`,
  },
  plugins: [],
  ...configOverrides,
}

export default config
