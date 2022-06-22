import { Parcel } from "@parcel/core"
import type { Diagnostic } from "@parcel/diagnostic"
import reporter from "gatsby-cli/lib/reporter"
import { ensureDir, emptyDir, existsSync, remove } from "fs-extra"
import telemetry from "gatsby-telemetry"

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
export function constructParcel(siteRoot: string): Parcel {
  return new Parcel({
    entries: [
      `${siteRoot}/${gatsbyFileRegex}`,
      `${siteRoot}/plugins/**/${gatsbyFileRegex}`,
    ],
    defaultConfig: require.resolve(`gatsby-parcel-config`),
    mode: `production`,
    targets: {
      root: {
        outputFormat: `commonjs`,
        includeNodeModules: false,
        sourceMap: false,
        engines: {
          node: `>= 14.15.0`,
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
    const parcel = constructParcel(siteRoot)
    const distDir = `${siteRoot}/${COMPILED_CACHE_DIR}`
    await ensureDir(distDir)
    await emptyDir(distDir)

    await exponentialBackoff(retry)

    const { bundleGraph } = await parcel.run()

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
        }

        reporter.verbose(
          `Failed to import compiled file "${bundle.filePath}", retrying (#${
            retry + 1
          } of ${RETRY_COUNT}) - "${e.message}"`
        )

        // sometimes parcel cache gets in weird state
        await remove(getCacheDir(siteRoot))

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
