import type { AdapterInit, IAdapterGatsbyConfig } from "gatsby"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface INetlifyAdapterOptions {
  excludeDatastoreFromEngineFunction?: boolean
}

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

const createNetlifyAdapter: AdapterInit<INetlifyAdapterOptions> = options => {
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
    config: (): IAdapterGatsbyConfig => {
      // if (process.env.DEPLOY_URL && process.env.NETLIFY) {
      // TODO: use env var as additional toggle on top on adapter options to ease migration from netlify plugins

      let deployURL = process.env.NETLIFY_LOCAL
        ? `http://localhost:8888`
        : process.env.DEPLOY_URL

      if (!deployURL) {
        // for dev purposes - remove later
        deployURL = `http://localhost:9000`
      }

      return {
        excludeDatastoreFromEngineFunction:
          options?.excludeDatastoreFromEngineFunction ?? false,
        deployURL,
      }
      // }

      // if (options?.excludeDatastoreFromEngineFunction) {
      //   reporter.warn(
      //     `[gatsby-adapter-netlify] excludeDatastoreFromEngineFunction is set to true but no DEPLOY_URL is set (running netlify command locally). Disabling excludeDatastoreFromEngineFunction.`
      //   )
      // }

      // return {
      //   excludeDatastoreFromEngineFunction: false,
      // }
    },
  }
}

export default createNetlifyAdapter
