import { createPageSSRBundle as createPageSSRBundleRollup } from "./bundle-rollup"
import { createPageSSRBundle as createPageSSRBundleWebpack } from "./bundle-webpack"

let createPageSSRBundle: () => Promise<void>
if (process.env.GATSBY_ENGINE_BUNDLER === `rollup`) {
  console.log(`Using rollup for ssr engine`)
  createPageSSRBundle = createPageSSRBundleRollup
} else {
  console.log(`Using webpack for ssr engine`)
  createPageSSRBundle = createPageSSRBundleWebpack
}

export { createPageSSRBundle }
