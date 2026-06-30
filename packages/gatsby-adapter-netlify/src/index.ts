import type { AdapterInit, IAdapterConfig } from "gatsby"

import { cwd, env } from "node:process"
import { join } from "path"

import { handleRoutesManifest } from "./route-handler"
import { prepareFileCdnHandler } from "./file-cdn-handler"
import { prepareFunction } from "./lambda-v2"

import packageJson from "gatsby-adapter-netlify/package.json"

interface INetlifyCacheUtilsOptions {
  cwd?: string
  digests?: Array<string>
  ttl?: number
}

interface INetlifyCacheUtils {
  restore: (
    paths: Array<string>,
    options?: INetlifyCacheUtilsOptions
  ) => Promise<boolean>
  save: (
    paths: Array<string>,
    options?: INetlifyCacheUtilsOptions
  ) => Promise<boolean>
}

interface INetlifyAdapterOptions {
  excludeDatastoreFromEngineFunction?: boolean
  imageCDN?: boolean
}

let _cacheUtils: INetlifyCacheUtils | undefined

async function getCacheUtils(): Promise<undefined | INetlifyCacheUtils> {
  if (_cacheUtils) {
    return _cacheUtils
  }

  let CACHE_DIR: string | undefined

  if (env.NETLIFY_LOCAL) {
    CACHE_DIR = join(cwd(), `.netlify`, `build-cache`)
  } else if (env.NETLIFY) {
    CACHE_DIR = `/opt/build/cache`
  }

  if (CACHE_DIR) {
    _cacheUtils = (await import(`@netlify/cache-utils`)).bindOpts({
      cacheDir: CACHE_DIR,
    })

    return _cacheUtils
  }

  return undefined
}

const createNetlifyAdapter: AdapterInit<INetlifyAdapterOptions> = options => {
  let useNetlifyImageCDN = options?.imageCDN

  if (
    typeof useNetlifyImageCDN === `undefined` &&
    typeof env.NETLIFY_IMAGE_CDN !== `undefined`
  ) {
    useNetlifyImageCDN =
      env.NETLIFY_IMAGE_CDN === `true` || env.NETLIFY_IMAGE_CDN === `1`
  }

  return {
    name: `gatsby-adapter-netlify`,
    cache: {
      async restore({ directories, reporter }): Promise<boolean> {
        const utils = await getCacheUtils()

        if (utils) {
          reporter.verbose(
            `[gatsby-adapter-netlify] using @netlify/cache-utils restore`
          )

          const didRestore = await utils.restore(directories, {})

          if (didRestore) {
            reporter.info(
              `[gatsby-adapter-netlify] Found a Gatsby cache. We're about to go FAST. ⚡`
            )
          }

          return didRestore
        }

        return false
      },
      async store({ directories, reporter }): Promise<void> {
        const utils = await getCacheUtils()

        if (utils) {
          reporter.verbose(
            `[gatsby-adapter-netlify] using @netlify/cache-utils save`
          )

          await utils.save(directories, {})

          reporter.info(
            `[gatsby-adapter-netlify] Stored the Gatsby cache to speed up future builds. 🔥`
          )
        }
      },
    },
    async adapt({
      functionsManifest,
      headerRoutes,
      pathPrefix,
      remoteFileAllowedUrls,
      routesManifest,
    }): Promise<void> {
      if (useNetlifyImageCDN) {
        await prepareFileCdnHandler({
          pathPrefix,
          remoteFileAllowedUrls,
        })
      }

      await handleRoutesManifest(
        routesManifest,
        headerRoutes,
        useNetlifyImageCDN ? remoteFileAllowedUrls : undefined
      )
      await Promise.all(functionsManifest.map(fun => prepareFunction(fun)))
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
        typeof env.GATSBY_EXCLUDE_DATASTORE_FROM_BUNDLE !== `undefined`
      ) {
        excludeDatastoreFromEngineFunction =
          env.GATSBY_EXCLUDE_DATASTORE_FROM_BUNDLE === `true` ||
          env.GATSBY_EXCLUDE_DATASTORE_FROM_BUNDLE === `1`
      }

      if (typeof excludeDatastoreFromEngineFunction === `undefined`) {
        excludeDatastoreFromEngineFunction = false
      }

      const deployURL = env.NETLIFY_LOCAL
        ? `http://localhost:8888`
        : env.DEPLOY_URL

      if (excludeDatastoreFromEngineFunction && !deployURL) {
        reporter.warn(
          `[gatsby-adapter-netlify] excludeDatastoreFromEngineFunction is set to true but no DEPLOY_URL is set. Disabling excludeDatastoreFromEngineFunction.`
        )

        excludeDatastoreFromEngineFunction = false
      }

      return {
        deployURL,
        excludeDatastoreFromEngineFunction,
        fileCDNUrlGeneratorModulePath: useNetlifyImageCDN
          ? require.resolve(`./file-cdn-url-generator`)
          : undefined,
        functionsArch: `x64`,
        functionsPlatform: `linux`,
        imageCDNUrlGeneratorModulePath: useNetlifyImageCDN
          ? require.resolve(`./image-cdn-url-generator`)
          : undefined,
        pluginsToDisable: [
          `gatsby-plugin-netlify`,
          `gatsby-plugin-netlify-cache`,
        ],
        supports: {
          pathPrefix: true,
          trailingSlash: [`always`, `never`, `ignore`],
        },
      }
    },
  }
}

export default createNetlifyAdapter
