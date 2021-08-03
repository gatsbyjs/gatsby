import { createGraphqlEngineBundle as createGraphqlEngineBundleRollup } from "./bundle-rollup"
import { createGraphqlEngineBundle as createGraphqlEngineBundleWebpack } from "./bundle-webpack"

let createGraphqlEngineBundle: () => Promise<void>
if (process.env.GATSBY_ENGINE_BUNDLER === `webpack`) {
  console.log(`Using webpack`)
  createGraphqlEngineBundle = createGraphqlEngineBundleWebpack
} else {
  console.log(`Using rollup`)
  createGraphqlEngineBundle = createGraphqlEngineBundleRollup
}

export { createGraphqlEngineBundle }
