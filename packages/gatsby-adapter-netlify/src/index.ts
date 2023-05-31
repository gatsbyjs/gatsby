import type { AdapterInit } from "gatsby"

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
