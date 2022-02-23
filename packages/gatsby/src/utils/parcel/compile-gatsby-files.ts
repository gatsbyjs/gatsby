import { Parcel } from "@parcel/core"
import type { Diagnostic } from "@parcel/diagnostic"
import reporter from "gatsby-cli/lib/reporter"
import { ensureDir, emptyDir, existsSync } from "fs-extra"

export const COMPILED_CACHE_DIR = `.cache/compiled`
export const PARCEL_CACHE_DIR = `.cache/.parcel-cache`
export const gatsbyFileRegex = `gatsby-+(node|config).ts`

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
    defaultConfig: require.resolve(`gatsby-parcel-config`, {
      paths: [siteRoot],
    }),
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
    cacheDir: `${siteRoot}/${PARCEL_CACHE_DIR}`,
  })
}

/**
 * Compile known gatsby-* files (e.g. `gatsby-config`, `gatsby-node`)
 * and output in `<SITE_ROOT>/.cache/compiled`.
 */
export async function compileGatsbyFiles(siteRoot: string): Promise<void> {
  try {
    const parcel = constructParcel(siteRoot)
    const distDir = `${siteRoot}/${COMPILED_CACHE_DIR}`
    await ensureDir(distDir)
    await emptyDir(distDir)
    await parcel.run()
  } catch (error) {
    handleErrors(error.diagnostics)
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
