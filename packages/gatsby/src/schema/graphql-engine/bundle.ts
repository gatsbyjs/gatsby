import { createGraphqlEngineBundle as createGraphqlEngineBundleRollup } from "./bundle-rollup"
import { createGraphqlEngineBundle as createGraphqlEngineBundleWebpack } from "./bundle-webpack"

let createGraphqlEngineBundle: () => Promise<void>
if (process.env.GATSBY_ENGINE_BUNDLER === `rollup`) {
  console.log(`Using rollup for query engine`)
  createGraphqlEngineBundle = createGraphqlEngineBundleRollup
} else {
  console.log(`Using webpack for query engine`)
  createGraphqlEngineBundle = createGraphqlEngineBundleWebpack
}

export { createGraphqlEngineBundle }
