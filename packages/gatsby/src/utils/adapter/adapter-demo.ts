import type { AdapterInit } from "./types"

const createDemoAdapter: AdapterInit = ({ reporter }) => {
  reporter.info(`[dev-adapter] createAdapter()`)

  return {
    name: `gatsby-adapter-demo`,
    cache: {
      restore(directories): void {
        console.log(`[dev-adapter] cache.restore()`, directories)
      },
      store(directories): void {
        console.log(`[dev-adapter] cache.store()`, directories)
      },
    },
    adapt({ routesManifest, functionsManifest }): void {
      console.log(`[dev-adapter] cache.adapt()`, {
        routesManifest,
        functionsManifest,
      })
    },
  }
}

export default createDemoAdapter
