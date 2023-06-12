import type { AdapterInit } from "gatsby/src/utils/adapter/types"

// just for debugging
// import { inspect } from "util"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface INetlifyAdapterOptions {}

import { prepareFunctionVariants } from "./lambda-handler"
import { handleRoutesManifest } from "./route-handler"

interface INetlifyCacheUtils {
  restore: (paths: Array<string>) => Promise<boolean>
  save: (paths: Array<string>) => Promise<boolean>
}

async function getCacheUtils(): Promise<undefined | INetlifyCacheUtils> {
  if (process.env.NETLIFY) {
    const CACHE_DIR = `/opt/build/cache`
    return (await import(`@netlify/cache-utils`)).bindOpts({
      cacheDir: CACHE_DIR,
    })
  }
  return undefined
}

const createNetlifyAdapter: AdapterInit<INetlifyAdapterOptions> = () => {
  return {
    name: `gatsby-adapter-netlify`,
    cache: {
      async restore({ directories, reporter }): Promise<boolean> {
        reporter.info(`[gatsby-adapter-netlify] cache.restore() ${directories}`)
        const utils = await getCacheUtils()
        if (utils) {
          reporter.info(
            `[gatsby-adapter-netlify] using @netlify/cache-utils restore`
          )
          return await utils.restore(directories)
        }

        return false
      },
      async store({ directories, reporter }): Promise<void> {
        reporter.info(`[gatsby-adapter-netlify] cache.store() ${directories}`)
        const utils = await getCacheUtils()
        if (utils) {
          reporter.info(
            `[gatsby-adapter-netlify] using @netlify/cache-utils save`
          )
          await utils.save(directories)
        }
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
