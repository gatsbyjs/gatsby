import type { AdapterInit } from "gatsby/src/utils/adapter/types"

// just for debugging
// import { inspect } from "util"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface INetlifyAdapterOptions {}

// @ts-ignore sigh, we compile to mjs, but it doesn't exist in source code, skipping extension result in error at runtime when
// loading this module because we need to supply mjs extension to actually load it. Adding extension makes typescript unhappy
// TODO: adjust build to convert import paths so typescript is happy and runtime actually works
import { prepareFunctionVariants } from "./lambda-handler.mjs"
// @ts-ignore same as above
import { handleRoutesManifest } from "./route-handler.mjs"

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
    async adapt({ routesManifest, functionsManifest }): Promise<void> {
      // this is noisy, so for now commented out to easily restore if some routes/functions debugging is needed
      // console.log(
      //   `[gatsby-adapter-netlify] adapt()`,
      //   inspect(
      //     {
      //       routesManifest,
      //       functionsManifest,
      //     },
      //     { depth: Infinity, colors: true }
      //   )
      // )

      const { lambdasThatUseCaching } = await handleRoutesManifest(
        routesManifest
      )

      // functions handling
      for (const fun of functionsManifest) {
        await prepareFunctionVariants(
          fun,
          lambdasThatUseCaching.get(fun.functionId)
        )
      }
    },
  }
}

export default createNetlifyAdapter
