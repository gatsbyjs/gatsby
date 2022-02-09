import { Parcel } from "@parcel/core"
import reporter from "gatsby-cli/lib/reporter"

export const COMPILED_CACHE_DIR = `.cache/compiled`

function constructBundler(dir: string): Parcel {
  return new Parcel({
    entries: `${dir}/gatsby-+(node|config).{ts,tsx,js}`,
    defaultConfig: `@parcel/config-default`,
    mode: `production`,
    targets: {
      default: {
        distDir: `${dir}/${COMPILED_CACHE_DIR}`,
        outputFormat: `commonjs`,
        includeNodeModules: false,
        sourceMap: false,
        engines: {
          node: `>= 14.15.0`,
        },
      },
    },
    cacheDir: `${dir}/.cache/.parcel-cache`,
  })
}

/**
 * Compiles known gatsby-* files (e.g. `gatsby-config`, `gatsby-node`)
 * and stores them in `.cache/compiled` relative to the site root.
 */
export async function compileGatsbyFiles(dir: string): Promise<void> {
  const bundler = constructBundler(dir)

  const activity = reporter.activityTimer(`compile gatsby files`)
  activity.start()

  try {
    await bundler.run()
  } catch (error) {
    activity.panic(`Failed to compile gatsby files.`, error)
  }

  activity.end()
}
