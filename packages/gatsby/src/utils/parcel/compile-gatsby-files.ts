import { Parcel } from "@parcel/core"
import { LMDBCache, Cache } from "@parcel/cache"
import path from "path"
import type { Diagnostic } from "@parcel/diagnostic"
import reporter from "gatsby-cli/lib/reporter"
import { WorkerPool } from "gatsby-worker"
import { ensureDir, emptyDir, existsSync, remove, readdir } from "fs-extra"
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

interface IProcessBundle {
  filePath: string
  mainEntryPath?: string
}

type RunParcelReturn = Array<IProcessBundle>

export async function runParcel(siteRoot: string): Promise<RunParcelReturn> {
  const cache = new LMDBCache(getCacheDir(siteRoot)) as unknown as Cache
  const parcel = constructParcel(siteRoot, cache)
  const { bundleGraph } = await parcel.run()
  const bundles = bundleGraph.getBundles()
  // bundles is not serializable, so we need to extract the data we need
  // so it crosses IPC boundaries
  return bundles.map(bundle => {
    return {
      filePath: bundle.filePath,
      mainEntryPath: bundle.getMainEntry()?.filePath,
    }
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
    const gatsbyNodeName = `gatsby-node`

    // Check for gatsby-node.jsx and gatsby-node.tsx (or other misnamed variations)
    // We want to filter out directory names so we can use "withFileTypes"
    // With "withFileTypes" the array will contain <fs.Dirent> objects
    const filesAndDirectories = await readdir(siteRoot, { withFileTypes: true })
    const files = filesAndDirectories
      .filter(i => !i.isDirectory())
      .map(i => i.name)

    let nearMatch = ``

    for (const file of files) {
      if (nearMatch) {
        break
      }

      const { name } = path.parse(file)
      // Of course, allow valid gatsby-node files
      if (
        file === `gatsby-node.js` ||
        file === `gatsby-node.mjs` ||
        file === `gatsby-node.ts`
      ) {
        break
      }

      // Check for likely misnamed files
      if (isNearMatch(name, gatsbyNodeName, 3)) {
        nearMatch = file
      }
    }

    // gatsby-node is misnamed
    if (nearMatch) {
      const isTSX = nearMatch.endsWith(`.tsx`)
      reporter.panic({
        id: `10128`,
        context: {
          configName: gatsbyNodeName,
          nearMatch,
          isTSX,
        },
      })
    }

    const worker = new WorkerPool<typeof import("./compile-gatsby-files")>(
      require.resolve(`./compile-gatsby-files`),
      {
        numWorkers: 1,
      }
    )

    const distDir = `${siteRoot}/${COMPILED_CACHE_DIR}`
    await ensureDir(distDir)
    await emptyDir(distDir)

    await exponentialBackoff(retry)

    let bundles: RunParcelReturn = []
    try {
      // sometimes parcel segfaults which is not something we can recover from, so we run parcel
      // in child process and IF it fails we try to delete parcel's cache (this seems to "fix" the problem
      // causing segfaults?) and retry few times
      // not ideal, but having gatsby segfaulting is really frustrating and common remedy is to clean
      // entire .cache for users, which is not ideal either especially when we can just delete parcel's cache
      // and to recover automatically
      bundles = await worker.single.runParcel(siteRoot)
    } catch (error) {
      if (error.diagnostics) {
        handleErrors(error.diagnostics)
        return
      } else if (retry >= RETRY_COUNT) {
        reporter.panic({
          id: `11904`,
          error,
          context: {
            siteRoot,
            retries: RETRY_COUNT,
            sourceMessage: error.message,
          },
        })
      } else {
        await exponentialBackoff(retry)
        try {
          await remove(getCacheDir(siteRoot))
        } catch {
          // in windows we might get "EBUSY" errors if LMDB failed to close, so this try/catch is
          // to prevent EBUSY errors from potentially hiding real import errors
        }
        await compileGatsbyFiles(siteRoot, retry + 1)
        return
      }
    } finally {
      worker.end()
    }

    await exponentialBackoff(retry)

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
              sourceFileLocation: bundle.mainEntryPath,
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

        try {
          await remove(getCacheDir(siteRoot))
        } catch {
          // in windows we might get "EBUSY" errors if LMDB failed to close, so this try/catch is
          // to prevent EBUSY errors from potentially hiding real import errors
        }

        await compileGatsbyFiles(siteRoot, retry + 1)
        return
      }

      const mainEntry = bundle.mainEntryPath
      // mainEntry won't exist for shared chunks
      if (mainEntry) {
        if (mainEntry.endsWith(`.ts`)) {
          compiledTSFilesCount = compiledTSFilesCount + 1
        }
      }
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
