import type { AdapterInit, IAdapterConfig } from "gatsby"
import { prepareFunctionVariants } from "./lambda-handler"
import { handleRoutesManifest } from "./route-handler"
import packageJson from "gatsby-adapter-netlify/package.json"

interface INetlifyCacheUtils {
  restore: (paths: Array<string>) => Promise<boolean>
  save: (paths: Array<string>) => Promise<boolean>
}

interface INetlifyAdapterOptions {
  excludeDatastoreFromEngineFunction?: boolean
}

let _cacheUtils: INetlifyCacheUtils | undefined
async function getCacheUtils(): Promise<undefined | INetlifyCacheUtils> {
  if (_cacheUtils) {
    return _cacheUtils
  }
  if (process.env.NETLIFY) {
    const CACHE_DIR = `/opt/build/cache`
    _cacheUtils = (await import(`@netlify/cache-utils`)).bindOpts({
      cacheDir: CACHE_DIR,
    })

    return _cacheUtils
  }
  return undefined
}

const createNetlifyAdapter: AdapterInit<INetlifyAdapterOptions> = options => {
  return {
    name: `gatsby-adapter-netlify`,
    cache: {
      async restore({ directories, reporter }): Promise<boolean> {
        const utils = await getCacheUtils()
        if (utils) {
          reporter.verbose(
            `[gatsby-adapter-netlify] using @netlify/cache-utils restore`
          )
          return await utils.restore(directories)
        }

        return false
      },
      async store({ directories, reporter }): Promise<void> {
        const utils = await getCacheUtils()
        if (utils) {
          reporter.verbose(
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
    config: ({ reporter }): IAdapterConfig => {
      reporter.verbose(
        `[gatsby-adapter-netlify] version: ${packageJson?.version ?? `unknown`}`
      )
      // excludeDatastoreFromEngineFunction can be enabled either via options or via env var (to preserve handling of env var that existed in Netlify build plugin).
      let excludeDatastoreFromEngineFunction =
        options?.excludeDatastoreFromEngineFunction

      if (
        typeof excludeDatastoreFromEngineFunction === `undefined` &&
        typeof process.env.GATSBY_EXCLUDE_DATASTORE_FROM_BUNDLE !== `undefined`
      ) {
        excludeDatastoreFromEngineFunction =
          process.env.GATSBY_EXCLUDE_DATASTORE_FROM_BUNDLE === `true` ||
          process.env.GATSBY_EXCLUDE_DATASTORE_FROM_BUNDLE === `1`
      }

      if (typeof excludeDatastoreFromEngineFunction === `undefined`) {
        excludeDatastoreFromEngineFunction = false
      }

      const deployURL = process.env.NETLIFY_LOCAL
        ? `http://localhost:8888`
        : process.env.DEPLOY_URL

      if (excludeDatastoreFromEngineFunction && !deployURL) {
        reporter.warn(
          `[gatsby-adapter-netlify] excludeDatastoreFromEngineFunction is set to true but no DEPLOY_URL is set. Disabling excludeDatastoreFromEngineFunction.`
        )
        excludeDatastoreFromEngineFunction = false
      }

      return {
        excludeDatastoreFromEngineFunction,
        deployURL,
        supports: {
          pathPrefix: false,
          trailingSlash: [`always`],
        },
        pluginsToDisable: [
          `gatsby-plugin-netlify-cache`,
          `gatsby-plugin-netlify`,
        ],
      }
    },
  }
}

export default createNetlifyAdapter
