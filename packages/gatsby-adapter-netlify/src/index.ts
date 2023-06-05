import type { AdapterInit } from "gatsby"

// just for debugging
import { inspect } from "util"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface INetlifyAdapterOptions {}

const createNetlifyAdapter: AdapterInit<INetlifyAdapterOptions> = () => {
  return {
    name: `gatsby-adapter-netlify`,
    cache: {
      restore({ directories, reporter }): void {
        reporter.info(`[gatsby-adapter-netlify] cache.restore() ${directories}`)
      },
      store({ directories, reporter }): void {
        reporter.info(`[gatsby-adapter-netlify] cache.store() ${directories}`)
      },
    },
    adapt({ routesManifest, functionsManifest, reporter }): void {
      reporter.info(`[gatsby-adapter-netlify] adapt()`)

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
