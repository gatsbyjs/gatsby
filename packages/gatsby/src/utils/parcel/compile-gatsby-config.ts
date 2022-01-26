import { Parcel } from "@parcel/core"
import reporter from "gatsby-cli/lib/reporter"

function constructBundler(dir: string): Parcel {
  return new Parcel({
    entries: `${dir}/gatsby-+(node|config).{ts,tsx,js}`,
    defaultConfig: `@parcel/config-default`,
    mode: `production`,
    targets: {
      default: {
        distDir: `${dir}/.cache/compiled`,
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

export async function compileGatsbyConfig(dir: string): Promise<void> {
  const bundler = constructBundler(dir)

  try {
    const { bundleGraph, buildTime } = await bundler.run()
    const bundles = bundleGraph.getBundles()
    reporter.log(`Built gatsby files (${bundles.length}) in ${buildTime}ms`)
  } catch (err) {
    reporter.panicOnBuild(err.diagnostics)
  }
}
