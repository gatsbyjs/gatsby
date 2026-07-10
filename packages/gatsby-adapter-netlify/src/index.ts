import type { AdapterInit, IAdapterConfig } from "gatsby"

import {
  chmod,
  copyFile,
  readdir,
  rename,
  stat,
  unlink,
} from "node:fs/promises"
import { cwd, env } from "node:process"
import { join, resolve } from "node:path"

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

/*
  @netlify/cache-utils copies files with cpy, which feeds paths to copy-file.
  copy-file uses fs.lstat() then stats.isFile() — false for symlinks — and throws
  EISDIR regardless of what the symlink points to. Gatsby's installMissing() runs
  `npm install` in .cache/internal-packages/linux-x64/ to fetch cross-platform native
  binaries for bundling, and npm creates .bin/ symlinks as part of that install.
  Walk the directories first and replace any file symlinks with real copies so
  cache-utils never encounters them.
*/

async function resolveFileSymlinks(directories: Array<string>): Promise<void> {
  async function walk(dir: string): Promise<void> {
    let entries

    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    await Promise.all(
      entries.map(async entry => {
        const fullPath = join(dir, entry.name)

        if (entry.isSymbolicLink()) {
          try {
            const targetStat = await stat(fullPath)

            if (targetStat.isFile()) {
              const tmp = `${fullPath}.__netlify_tmp`
              await copyFile(fullPath, tmp)
              await chmod(tmp, targetStat.mode)
              await unlink(fullPath)
              await rename(tmp, fullPath)
            }
          } catch {
            // broken symlink or unreadable target — leave it
          }
        } else if (entry.isDirectory()) {
          await walk(fullPath)
        }
      })
    )
  }

  await Promise.all(directories.map(dir => walk(resolve(cwd(), dir))))
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

          await resolveFileSymlinks(directories)
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

      // Function-type routes (e.g. per-page SSR/DSG routes sharing the
      // `ssr-engine` functionId) tell us the specific paths each function
      // should be registered for, instead of relying on a catch-all.
      const pathsByFunctionId = new Map<string, Set<string>>()
      for (const route of routesManifest) {
        if (route.type !== `function`) {
          continue
        }

        const paths = pathsByFunctionId.get(route.functionId)
        if (paths) {
          paths.add(route.path)
        } else {
          pathsByFunctionId.set(route.functionId, new Set([route.path]))
        }
      }

      await Promise.all(
        functionsManifest.map(fun =>
          prepareFunction(
            fun,
            [...(pathsByFunctionId.get(fun.functionId) ?? [])],
            pathPrefix
          )
        )
      )
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
