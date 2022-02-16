import { Parcel } from "@parcel/core"
import reporter from "gatsby-cli/lib/reporter"
import { ensureDir } from "fs-extra"

export const COMPILED_CACHE_DIR = `.cache/compiled`
export const PARCEL_CACHE_DIR = `.cache/.parcel-cache`
export const gatsbyFileRegex = `gatsby-+(node|config).{ts,tsx,js}`
export const commonTargetOptions = {
  outputFormat: `commonjs`,
  includeNodeModules: false,
  sourceMap: false,
  engines: {
    node: `>= 14.15.0`,
  },
}

export type IParcelConfig = Array<IParcelConfigItem>

export interface IParcelConfigItem {
  entry: string
  dist: string
}

/**
 * Construct Parcel with config. Multiple targets may be provided for a single run.
 * @see {@link https://parceljs.org/features/targets/}
 */
export function constructParcel(
  parcelConfig: IParcelConfig,
  siteRoot: string
): Parcel {
  const entries: Array<string> = []
  const targets = {}

  for (const { entry, dist } of parcelConfig) {
    if (!entry || !dist) {
      continue
    }
    entries.push(`${entry}/${gatsbyFileRegex}`)
    targets[dist] = {
      ...commonTargetOptions,
      distDir: dist,
    }
  }

  return new Parcel({
    entries,
    defaultConfig: `gatsby-parcel-config`,
    mode: `production`,
    targets,
    cacheDir: `${siteRoot}/${PARCEL_CACHE_DIR}`,
  })
}

/**
 * Compile known gatsby-* files (e.g. `gatsby-config`, `gatsby-node`) and output
 * in the target dist from the provided config (e.g. `<ROOT_DIR>/.cache/compiled`).
 */
export async function compileGatsbyFiles(
  parcelConfig: IParcelConfig,
  siteRoot: string
): Promise<void> {
  const parcel = constructParcel(parcelConfig, siteRoot)

  try {
    await ensureDir(COMPILED_CACHE_DIR)
    await parcel.run()
  } catch (error) {
    reporter.panic(`Failed to compile gatsby files.`, error)
  }
}
