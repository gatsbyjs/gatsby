import { createGraphqlEngineBundle as createGraphqlEngineBundleRollup } from "./bundle-rollup"
import { createGraphqlEngineBundle as createGraphqlEngineBundleWebpack } from "./bundle-webpack"

let createGraphqlEngineBundle: () => Promise<void>
if (process.env.GATSBY_ENGINE_BUNDLER === `rollup`) {
  console.log(`Using rollup`)
  createGraphqlEngineBundle = createGraphqlEngineBundleRollup
} else {
  console.log(`Using webpack`)
  createGraphqlEngineBundle = createGraphqlEngineBundleWebpack
}

export { createGraphqlEngineBundle }
