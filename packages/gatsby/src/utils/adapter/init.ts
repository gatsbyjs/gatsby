import reporter from "gatsby-cli/lib/reporter"
import { createRequireFromPath } from "gatsby-core-utils/create-require-from-path"
import { join } from "path"
import { emptyDir, ensureDir, outputJson } from "fs-extra"
import execa, { Options as ExecaOptions } from "execa"
import {
  AdapterInit,
} from "./types"
import { preferDefault } from "../../bootstrap/prefer-default"
import { getLatestAdapters } from "../get-latest-gatsby-files"

const getAdaptersCacheDir = (): string => join(process.cwd(), `.cache/adapters`)

export async function getAdapterInit(): Promise<AdapterInit | undefined> {
  const latestAdapters = await getLatestAdapters()

  // Find the correct adapter and its details (e.g. version)
  const adapterToUse = latestAdapters.find((candidate) => candidate.test())

  if (!adapterToUse) {
    reporter.verbose(
      `No adapter was found for the current environment. Skipping adapter initialization.`
    )
    return undefined
  }

  // TODO: Add handling to allow for an env var to force a specific adapter to be used

  // Check if the user has manually installed the adapter and try to resolve it from there
  try {
    const siteRequire = createRequireFromPath(`${process.cwd()}/:internal:`)
    /*
    const adapterPackageJson = siteRequire(
      `${adapterToUse.module}/package.json`
    )
    */

    // TODO: Add handling for checking if installed version is compatible with current Gatsby version
    
    const required = siteRequire.resolve(adapterToUse.module)
    
    if (required) {
      reporter.verbose(`Reusing existing adapter ${adapterToUse.module} inside node_modules`)

      return preferDefault(
        await import(required)
      ) as AdapterInit
    }
  } catch (e) {
    // no-op
  }

  // Check if a previous run has installed the correct adapter into .cache/adapters already and try to resolve it from there
  try {
    const adaptersRequire = createRequireFromPath(`${getAdaptersCacheDir()}/:internal:`)
    const required = adaptersRequire.resolve(adapterToUse.module)

    if (required) {
      reporter.verbose(`Reusing existing adapter ${adapterToUse.module} inside .cache/adapters`)

      return preferDefault(await import(required)) as AdapterInit
    }
  } catch (e) {
    // no-op
  }

  const installTimer = reporter.activityTimer(`Installing adapter ${adapterToUse.module}`)
  // If both a manually installed version and a cached version are not found, install the adapter into .cache/adapters
  try {
    installTimer.start()
    await createAdaptersCacheDir()

    const options: ExecaOptions = {
      stderr: `inherit`,
      cwd: getAdaptersCacheDir(),
    }

    const npmAdditionalCliArgs = [
      `--no-progress`,
      `--no-audit`,
      `--no-fund`,
      `--loglevel`,
      `error`,
      `--color`,
      `always`,
      `--legacy-peer-deps`,
      `--save-exact`
    ]

    await execa(
      `npm`,
      [`install`, ...npmAdditionalCliArgs, adapterToUse.module],
      options
    )

    installTimer.end()

    reporter.info(`If you plan on staying on this deployment platform, consider installing ${adapterToUse.module} as a devDependency in your project. This will give you faster and more robust installs.`)

    const adaptersRequire = createRequireFromPath(`${getAdaptersCacheDir()}/:internal:`)
    const required = adaptersRequire.resolve(adapterToUse.module)

    if (required) {
      reporter.verbose(`Using installed adapter ${adapterToUse.module} inside .cache/adapters`)

      return preferDefault(await import(required)) as AdapterInit
    }
  } catch (e) {
    installTimer.end()
    console.log({ e })
    reporter.warn(`Could not install adapter ${adapterToUse.module}. Please install it yourself by adding it to your package.json's devDependencies and try building your project again.`)
  }

  return undefined
}

const createAdaptersCacheDir = async (): Promise<void> => {
  await ensureDir(getAdaptersCacheDir())
  await emptyDir(getAdaptersCacheDir())

  const packageJsonPath = join(getAdaptersCacheDir(), `package.json`)
  
  await outputJson(packageJsonPath, {
    name: `gatsby-adapters`,
    description: `This directory contains adapters that have been automatically installed by Gatsby.`,
    version: `1.0.0`,
    private: true,
    author: `Gatsby`,
    license: `MIT`,
  })
}
