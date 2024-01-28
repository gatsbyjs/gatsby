import { inspect } from "util"
import type { AdapterInit } from "gatsby"

const createTestingAdapter: AdapterInit = adapterOptions => {
  return {
    name: `gatsby-adapter-debug`,
    cache: {
      restore({ directories, reporter }) {
        reporter.info(`[gatsby-adapter-debug] cache.restore() ${directories}`)
      },
      store({ directories, reporter }) {
        reporter.info(`[gatsby-adapter-debug] cache.store() ${directories}`)
      },
    },
    adapt({
      routesManifest,
      headerRoutes,
      functionsManifest,
      pathPrefix,
      trailingSlash,
      reporter,
    }) {
      reporter.info(`[gatsby-adapter-debug] adapt()`)

      console.log(
        `[gatsby-adapter-debug] adapt()`,
        inspect(
          {
            routesManifest,
            headerRoutes,
            functionsManifest,
            pathPrefix,
            trailingSlash,
          },
          {
            depth: Infinity,
            colors: true,
          }
        )
      )
    },
  }
}

export default createTestingAdapter
