import { Parcel } from "@parcel/core"
import reporter from "gatsby-cli/lib/reporter"
import { ensureDir } from "fs-extra"

export const COMPILED_CACHE_DIR = `.cache/compiled`

const rootDir = process.cwd()
const gatsbyFileRegex = `gatsby-+(node|config).{ts,tsx,js}`

const commonTargetOptions = {
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
export function constructParcel(parcelConfig: IParcelConfig): Parcel {
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
    cacheDir: `${rootDir}/.cache/.parcel-cache`,
  })
}

/**
 * Compile known gatsby-* files (e.g. `gatsby-config`, `gatsby-node`) and output
 * in the target dist from the provided config (e.g. `<ROOT_DIR>/.cache/compiled`).
 */
export async function compileGatsbyFiles(
  parcelConfig: IParcelConfig
): Promise<void> {
  const parcel = constructParcel(parcelConfig)

  try {
    await ensureDir(COMPILED_CACHE_DIR)
    await parcel.run()
  } catch (error) {
    reporter.panic(`Failed to compile gatsby files.`, error)
  }
}
