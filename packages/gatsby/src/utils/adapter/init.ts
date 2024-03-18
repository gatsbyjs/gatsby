import reporter from "gatsby-cli/lib/reporter"
import _ from "lodash"
import { createRequireFromPath } from "gatsby-core-utils/create-require-from-path"
import { join } from "path"
import { emptyDir, ensureDir, outputJson } from "fs-extra"
import execa, { Options as ExecaOptions } from "execa"
import { version as gatsbyVersionFromPackageJson } from "gatsby/package.json"
import { satisfies } from "semver"
import type { AdapterInit } from "./types"
import { preferDefault } from "../../bootstrap/prefer-default"
import { getLatestAdapters } from "../get-latest-gatsby-files"
import { maybeAddFileProtocol } from "../../bootstrap/resolve-js-file-path"

export const getAdaptersCacheDir = (): string =>
  join(process.cwd(), `.cache/adapters`)

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

interface IAdapterToUse {
  name: string
  module: string
  gatsbyVersion: string
  moduleVersion: string
}

const tryLoadingAlreadyInstalledAdapter = async ({
  adapterToUse,
  installLocation,
  currentGatsbyVersion,
}: {
  adapterToUse: IAdapterToUse
  currentGatsbyVersion: string
  installLocation: string
}): Promise<
  | {
      found: false
    }
  | ({
      found: true
      installedVersion: string
    } & (
      | {
          compatible: false
          incompatibilityReason: string
        }
      | {
          compatible: true
          loadedModule: AdapterInit
        }
    ))
> => {
  try {
    const locationRequire = createRequireFromPath(
      `${installLocation}/:internal:`
    )
    const adapterPackageJson = locationRequire(
      `${adapterToUse.module}/package.json`
    )
    const adapterPackageVersion = adapterPackageJson?.version

    // Check if installed adapter version is compatible with the current Gatsby version based on the manifest
    if (
      !satisfies(adapterPackageVersion, adapterToUse.moduleVersion, {
        includePrerelease: true,
      })
    ) {
      return {
        found: true,
        compatible: false,
        installedVersion: adapterPackageVersion,
        incompatibilityReason: `Used gatsby version "${currentGatsbyVersion}" requires "${adapterToUse.module}@${adapterToUse.moduleVersion}". Installed "${adapterToUse.module}" version: "${adapterPackageVersion}".`,
      }
    }

    const required = maybeAddFileProtocol(
      locationRequire.resolve(adapterToUse.module)
    )
    if (required) {
      return {
        found: true,
        compatible: true,
        installedVersion: adapterPackageVersion,
        loadedModule: preferDefault(
          preferDefault(await import(required))
        ) as AdapterInit,
      }
    } else {
      return {
        found: false,
      }
    }
  } catch (e) {
    return {
      found: false,
    }
  }
}

const handleAdapterProblem = (
  message: string,
  panicFn = reporter.panic
): never | undefined => {
  if (!process.env.GATSBY_CONTINUE_BUILD_ON_ADAPTER_MISMATCH) {
    panicFn(
      `${message}\n\nZero-configuration deployment failed to avoid potentially broken deployment.\nIf you want build to continue despite above problems:\n - configure adapter manually in gatsby-config which will skip zero-configuration deployment attempt\n - or set GATSBY_CONTINUE_BUILD_ON_MISSING_ADAPTER=true environment variable to continue build without an adapter.`
    )
  } else {
    reporter.warn(
      `${message}\n\nContinuing build using without using any adapter due to GATSBY_CONTINUE_BUILD_ON_MISSING_ADAPTER environment variable being set`
    )
  }
  return undefined
}

export async function getAdapterInit(
  currentGatsbyVersion: string = gatsbyVersionFromPackageJson
): Promise<AdapterInit | undefined> {
  // 0. Try to fetch the latest adapters manifest - if it fails, we continue with manifest packaged with current version of gatsby
  const latestAdapters = await getLatestAdapters()

  // 1. Find adapter candidates that are compatible with the current environment
  //    we find all matching adapters in case package is renamed in the future and future gatsby versions will need different package than previous ones
  const adapterEntry = latestAdapters.find(candidate => candidate.test())

  if (!adapterEntry) {
    reporter.verbose(
      `No adapter was found for the current environment. Skipping adapter initialization.`
    )
    return undefined
  }

  // 2.From the manifest entry find one that supports current Gatsby version and identify it's version to use
  //   First matching one will be used.
  let adapterToUse: IAdapterToUse | undefined = undefined

  for (const versionEntry of adapterEntry.versions) {
    if (
      satisfies(currentGatsbyVersion, versionEntry.gatsbyVersion, {
        includePrerelease: true,
      })
    ) {
      adapterToUse = {
        name: adapterEntry.name,
        module: versionEntry.module ?? adapterEntry.module,
        gatsbyVersion: versionEntry.gatsbyVersion,
        moduleVersion: versionEntry.moduleVersion,
      }
      break
    }
  }

  if (!adapterToUse) {
    return handleAdapterProblem(
      `No version of ${adapterEntry.name} adapter is compatible with your current Gatsby version ${currentGatsbyVersion}.`
    )
  }

  {
    // 3. Check if the user has manually installed the adapter and try to resolve it from there
    const adapterInstalledByUserResults =
      await tryLoadingAlreadyInstalledAdapter({
        adapterToUse,
        installLocation: process.cwd(),
        currentGatsbyVersion,
      })
    if (adapterInstalledByUserResults.found) {
      if (adapterInstalledByUserResults.compatible) {
        reporter.verbose(
          `Using site's adapter dependency "${adapterToUse.module}@${adapterInstalledByUserResults.installedVersion}"`
        )
        return adapterInstalledByUserResults.loadedModule
      } else {
        reporter.warn(
          `Ignoring incompatible ${adapterToUse.module}@${adapterInstalledByUserResults.installedVersion} installed by site. ${adapterInstalledByUserResults.incompatibilityReason}`
        )
      }
    }
  }

  {
    // 4. Check if a previous run has installed the correct adapter into .cache/adapters already and try to resolve it from there
    const adapterPreviouslyInstalledInCacheAdaptersResults =
      await tryLoadingAlreadyInstalledAdapter({
        adapterToUse,
        installLocation: getAdaptersCacheDir(),
        currentGatsbyVersion,
      })

    if (adapterPreviouslyInstalledInCacheAdaptersResults.found) {
      if (adapterPreviouslyInstalledInCacheAdaptersResults.compatible) {
        reporter.verbose(
          `Using previously adapter previously installed by gatsby "${adapterToUse.module}@${adapterPreviouslyInstalledInCacheAdaptersResults.installedVersion}"`
        )
        return adapterPreviouslyInstalledInCacheAdaptersResults.loadedModule
      } else {
        reporter.verbose(
          `Ignoring incompatible ${adapterToUse.module} installed by gatsby in ".cache/adapters" before. ${adapterPreviouslyInstalledInCacheAdaptersResults.incompatibilityReason}`
        )
      }
    }
  }

  {
    // 5. If user has not installed the adapter manually or is incompatible and we don't have cached version installed by gatsby or that version is not compatible
    //    we try to install compatible version into .cache/adapters
    const installTimer = reporter.activityTimer(
      `Installing ${adapterToUse.name} adapter (${adapterToUse.module}@${adapterToUse.moduleVersion})`
    )

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
        `--save-exact`,
      ]

      await execa(
        `npm`,
        [
          `install`,
          ...npmAdditionalCliArgs,
          `${adapterToUse.module}@${adapterToUse.moduleVersion}`,
        ],
        options
      )
    } catch (e) {
      return handleAdapterProblem(
        `Could not install adapter "${adapterToUse.module}@${adapterToUse.moduleVersion}". Please install it yourself by adding it to your package.json's dependencies and try building your project again.`,
        installTimer.panic
      )
    }

    installTimer.end()
  }

  {
    // 5. Try to load again from ".cache/adapters"
    const adapterAutoInstalledInCacheAdaptersResults =
      await tryLoadingAlreadyInstalledAdapter({
        adapterToUse,
        installLocation: getAdaptersCacheDir(),
        currentGatsbyVersion,
      })

    if (adapterAutoInstalledInCacheAdaptersResults.found) {
      if (adapterAutoInstalledInCacheAdaptersResults.compatible) {
        reporter.info(
          `If you plan on staying on this deployment platform, consider installing "${adapterToUse.module}@${adapterToUse.moduleVersion}" as a dependency in your project. This will give you faster and more robust installs.`
        )
        return adapterAutoInstalledInCacheAdaptersResults.loadedModule
      } else {
        // this indicates a bug as we install version with range from manifest, and now after trying to load the adapter we consider that adapter incompatible
        return handleAdapterProblem(
          `Auto installed adapter "${adapterToUse.module}@${adapterAutoInstalledInCacheAdaptersResults.installedVersion}"`
        )
      }
    } else {
      // this indicates a bug with adapter itself (fail to resolve main entry point) OR the adapter loading logic
      return handleAdapterProblem(
        `Could not load adapter "${adapterToUse.module}@${adapterToUse.moduleVersion}". Adapter entry point is not resolvable.`
      )
    }
  }
}
