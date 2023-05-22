// TODO: make those types publicly exported from gatsby (?)
// for now we can just reference types we have in monorepo
import type { AdapterInit } from "gatsby/src/utils/adapter/types"

// just for debugging
import { inspect } from "util"

const createNetlifyAdapter: AdapterInit = ({ reporter }) => {
  reporter.info(`[gatsby-adapter-netlify] createAdapter()`)

  return {
    name: `gatsby-adapter-netlify`,
    cache: {
      restore(directories): void {
        console.log(`[gatsby-adapter-netlify] cache.restore()`, directories)
      },
      store(directories): void {
        console.log(`[gatsby-adapter-netlify] cache.store()`, directories)
      },
    },
    adapt({ routesManifest, functionsManifest }): void {
      console.log(
        `[gatsby-adapter-netlify] adapt()`,
        inspect(
          {
            routesManifest,
            functionsManifest,
          },
          { depth: Infinity, colors: true }
        )
      )
    },
  }
}

export default createNetlifyAdapter
