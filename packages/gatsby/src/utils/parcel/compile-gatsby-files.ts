import { Parcel } from "@parcel/core"
import { LMDBCache, Cache } from "@parcel/cache"
import path from "path"
import type { Diagnostic } from "@parcel/diagnostic"
import reporter from "gatsby-cli/lib/reporter"
import { ensureDir, emptyDir, existsSync, remove, readdir } from "fs-extra"
import telemetry from "gatsby-telemetry"
import { isNearMatch } from "../is-near-match"

export const COMPILED_CACHE_DIR = `.cache/compiled`
export const PARCEL_CACHE_DIR = `.cache/.parcel-cache`
export const gatsbyFileRegex = `gatsby-+(node|config).ts`
const RETRY_COUNT = 5

function getCacheDir(siteRoot: string): string {
  return `${siteRoot}/${PARCEL_CACHE_DIR}`
}

function exponentialBackoff(retry: number): Promise<void> {
  if (retry === 0) {
    return Promise.resolve()
  }
  const timeout = 50 * Math.pow(2, retry)
  return new Promise(resolve => setTimeout(resolve, timeout))
}

/**
 * Construct Parcel with config.
 * @see {@link https://parceljs.org/features/targets/}
 */
export function constructParcel(siteRoot: string, cache?: Cache): Parcel {
  return new Parcel({
    entries: [
      `${siteRoot}/${gatsbyFileRegex}`,
      `${siteRoot}/plugins/**/${gatsbyFileRegex}`,
    ],
    defaultConfig: require.resolve(`gatsby-parcel-config`),
    mode: `production`,
    cache,
    targets: {
      root: {
        outputFormat: `commonjs`,
        includeNodeModules: false,
        sourceMap: process.env.NODE_ENV === `development`,
        engines: {
          node: _CFLAGS_.GATSBY_MAJOR === `5` ? `>= 18.0.0` : `>= 14.15.0`,
        },
        distDir: `${siteRoot}/${COMPILED_CACHE_DIR}`,
      },
    },
    cacheDir: getCacheDir(siteRoot),
  })
}

/**
 * Compile known gatsby-* files (e.g. `gatsby-config`, `gatsby-node`)
 * and output in `<SITE_ROOT>/.cache/compiled`.
 */
export async function compileGatsbyFiles(
  siteRoot: string,
  retry: number = 0
): Promise<void> {
  try {
    // Check for gatsby-node.jsx and gatsby-node.tsx (or other misnamed variations)
    const files = await readdir(siteRoot)

    let nearMatch = ``
    const configName = `gatsby-node`

    for (const file of files) {
      if (nearMatch) {
        break
      }

      const { name } = path.parse(file)
      // Of course, allow valid gatsby-node files
      if (file === `gatsby-node.js` || file === `gatsby-node.ts`) {
        break
      }

      if (isNearMatch(name, configName, 3)) {
        nearMatch = file
      }
    }

    // gatsby-node is misnamed
    if (nearMatch) {
      const isTSX = nearMatch.endsWith(`.tsx`)
      reporter.panic({
        id: `10128`,
        context: {
          configName,
          nearMatch,
          isTSX,
        },
      })
    }

    const distDir = `${siteRoot}/${COMPILED_CACHE_DIR}`
    await ensureDir(distDir)
    await emptyDir(distDir)

    await exponentialBackoff(retry)

    // for whatever reason TS thinks LMDBCache is some browser Cache and not actually Parcel's Cache
    // so we force type it to Parcel's Cache
    const cache = new LMDBCache(getCacheDir(siteRoot)) as unknown as Cache
    const parcel = constructParcel(siteRoot, cache)
    const { bundleGraph } = await parcel.run()
    let cacheClosePromise = Promise.resolve()
    try {
      // @ts-ignore store is public field on LMDBCache class, but public interface for Cache
      // doesn't have it. There doesn't seem to be proper public API for this, so we have to
      // resort to reaching into internals. Just in case this is wrapped in try/catch if
      // parcel changes internals in future (closing cache is only needed when retrying
      // so the if the change happens we shouldn't fail on happy builds)
      cacheClosePromise = cache.store.close()
    } catch (e) {
      reporter.verbose(`Failed to close parcel cache\n${e.toString()}`)
    }

    await exponentialBackoff(retry)

    const bundles = bundleGraph.getBundles()

    if (bundles.length === 0) return

    let compiledTSFilesCount = 0
    for (const bundle of bundles) {
      // validate that output exists and is valid
      try {
        delete require.cache[bundle.filePath]
        require(bundle.filePath)
      } catch (e) {
        if (retry >= RETRY_COUNT) {
          reporter.panic({
            id: `11904`,
            context: {
              siteRoot,
              retries: RETRY_COUNT,
              compiledFileLocation: bundle.filePath,
              sourceFileLocation: bundle.getMainEntry()?.filePath,
            },
          })
        } else if (retry > 0) {
          // first retry is most flaky and it seems it always get in good state
          // after that - most likely cache clearing is the trick that fixes the problem
          reporter.verbose(
            `Failed to import compiled file "${
              bundle.filePath
            }" after retry, attempting another retry (#${
              retry + 1
            } of ${RETRY_COUNT}) - "${e.message}"`
          )
        }

        // sometimes parcel cache gets in weird state and we need to clear the cache
        await cacheClosePromise

        try {
          await remove(getCacheDir(siteRoot))
        } catch {
          // in windows we might get "EBUSY" errors if LMDB failed to close, so this try/catch is
          // to prevent EBUSY errors from potentially hiding real import errors
        }

        await compileGatsbyFiles(siteRoot, retry + 1)
        return
      }

      const mainEntry = bundle.getMainEntry()?.filePath
      // mainEntry won't exist for shared chunks
      if (mainEntry) {
        if (mainEntry.endsWith(`.ts`)) {
          compiledTSFilesCount = compiledTSFilesCount + 1
        }
      }
    }

    if (telemetry.isTrackingEnabled()) {
      telemetry.trackCli(`PARCEL_COMPILATION_END`, {
        valueInteger: compiledTSFilesCount,
        name: `count of compiled ts files`,
      })
    }
  } catch (error) {
    if (error.diagnostics) {
      handleErrors(error.diagnostics)
    } else {
      reporter.panic({
        id: `11903`,
        error,
        context: {
          siteRoot,
          sourceMessage: error.message,
        },
      })
    }
  }
}

function handleErrors(diagnostics: Array<Diagnostic>): void {
  diagnostics.forEach(err => {
    if (err.codeFrames) {
      err.codeFrames.forEach(c => {
        // Assuming that codeHighlights only ever has one entry in the array. Local tests only ever showed one
        const codeHighlightsMessage = c?.codeHighlights[0]?.message
        // If both messages are the same don't print the specific, otherwise they would be duplicate
        const specificMessage =
          codeHighlightsMessage === err.message
            ? undefined
            : codeHighlightsMessage
        reporter.panic({
          id: `11901`,
          context: {
            filePath: c?.filePath,
            generalMessage: err.message,
            specificMessage,
            origin: err?.origin,
            hints: err?.hints,
          },
        })
      })
    } else {
      reporter.panic({
        id: `11901`,
        context: {
          generalMessage: err.message,
          origin: err?.origin,
          hints: err?.hints,
        },
      })
    }
  })
}

export function getResolvedFieldsForPlugin(
  rootDir: string,
  pluginName: string
): {
  resolvedCompiledGatsbyNode?: string
} {
  return {
    resolvedCompiledGatsbyNode: findCompiledLocalPluginModule(
      rootDir,
      pluginName,
      `gatsby-node`
    ),
  }
}

export function findCompiledLocalPluginModule(
  rootDir: string,
  pluginName: string,
  moduleName: "gatsby-config" | "gatsby-node"
): string | undefined {
  const compiledPathForPlugin =
    pluginName === `default-site-plugin`
      ? `${rootDir}/${COMPILED_CACHE_DIR}`
      : `${rootDir}/${COMPILED_CACHE_DIR}/plugins/${pluginName}`

  const compiledPathForModule = `${compiledPathForPlugin}/${moduleName}.js`

  const isCompiled = existsSync(compiledPathForModule)
  if (isCompiled) {
    return compiledPathForModule
  }

  return undefined
}
