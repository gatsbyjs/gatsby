import reporter from "gatsby-cli/lib/reporter"
import _ from "lodash"
import { createRequireFromPath } from "gatsby-core-utils/create-require-from-path"
import { join } from "path"
import { emptyDir, ensureDir, outputJson } from "fs-extra"
import execa, { Options as ExecaOptions } from "execa"
import { version as gatsbyVersion } from "gatsby/package.json"
import { satisfies } from "semver"
import type { AdapterInit } from "./types"
import { preferDefault } from "../../bootstrap/prefer-default"
import { getLatestAdapters } from "../get-latest-gatsby-files"

const getAdaptersCacheDir = (): string => join(process.cwd(), `.cache/adapters`)

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

export async function getAdapterInit(): Promise<AdapterInit | undefined> {
  // 1. Find the correct adapter and its details (e.g. version)
  const latestAdapters = await getLatestAdapters()
  const adapterToUse = latestAdapters.find(candidate => candidate.test())

  if (!adapterToUse) {
    reporter.verbose(
      `No adapter was found for the current environment. Skipping adapter initialization.`
    )
    return undefined
  }

  const versionForCurrentGatsbyVersion = adapterToUse.versions.find(entry =>
    satisfies(gatsbyVersion, entry.gatsbyVersion, { includePrerelease: true })
  )

  if (!versionForCurrentGatsbyVersion) {
    reporter.verbose(
      `The ${adapterToUse.name} adapter is not compatible with your current Gatsby version ${gatsbyVersion}.`
    )
    return undefined
  }

  // 2. Check if the user has manually installed the adapter and try to resolve it from there
  try {
    const siteRequire = createRequireFromPath(`${process.cwd()}/:internal:`)
    const adapterPackageJson = siteRequire(
      `${adapterToUse.module}/package.json`
    )
    const adapterGatsbyPeerDependency = _.get(
      adapterPackageJson,
      `peerDependencies.gatsby`
    )
    const moduleVersion = adapterPackageJson?.version

    // Check if the peerDependency of the adapter is compatible with the current Gatsby version
    if (
      adapterGatsbyPeerDependency &&
      !satisfies(gatsbyVersion, adapterGatsbyPeerDependency, {
        includePrerelease: true,
      })
    ) {
      reporter.warn(
        `The ${adapterToUse.name} adapter is not compatible with your current Gatsby version ${gatsbyVersion} - It requires gatsby@${adapterGatsbyPeerDependency}`
      )
      return undefined
    }

    // Cross-check the adapter version with the version manifest and see if the adapter version is correct for the current Gatsby version
    const isAdapterCompatible = satisfies(
      moduleVersion,
      versionForCurrentGatsbyVersion.moduleVersion,
      {
        includePrerelease: true,
      }
    )

    if (!isAdapterCompatible) {
      reporter.warn(
        `${adapterToUse.module}@${moduleVersion} is not compatible with your current Gatsby version ${gatsbyVersion} - Install ${adapterToUse.module}@${versionForCurrentGatsbyVersion.moduleVersion} or later.`
      )

      return undefined
    }

    const required = siteRequire.resolve(adapterToUse.module)

    if (required) {
      reporter.verbose(
        `Reusing existing adapter ${adapterToUse.module} inside node_modules`
      )

      // TODO: double preferDefault is most ceirtainly wrong - figure it out
      return preferDefault(preferDefault(await import(required))) as AdapterInit
    }
  } catch (e) {
    // no-op
  }

  // 3. Check if a previous run has installed the correct adapter into .cache/adapters already and try to resolve it from there
  try {
    const adaptersRequire = createRequireFromPath(
      `${getAdaptersCacheDir()}/:internal:`
    )
    const required = adaptersRequire.resolve(adapterToUse.module)

    if (required) {
      reporter.verbose(
        `Reusing existing adapter ${adapterToUse.module} inside .cache/adapters`
      )

      // TODO: double preferDefault is most ceirtainly wrong - figure it out
      return preferDefault(preferDefault(await import(required))) as AdapterInit
    }
  } catch (e) {
    // no-op
  }

  const installTimer = reporter.activityTimer(
    `Installing ${adapterToUse.name} adapter (${adapterToUse.module}@${versionForCurrentGatsbyVersion.moduleVersion})`
  )
  // 4. If both a manually installed version and a cached version are not found, install the adapter into .cache/adapters
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
        `${adapterToUse.module}@${versionForCurrentGatsbyVersion.moduleVersion}`,
      ],
      options
    )

    installTimer.end()

    reporter.info(
      `If you plan on staying on this deployment platform, consider installing ${adapterToUse.module} as a dependency in your project. This will give you faster and more robust installs.`
    )

    const adaptersRequire = createRequireFromPath(
      `${getAdaptersCacheDir()}/:internal:`
    )
    const required = adaptersRequire.resolve(adapterToUse.module)

    if (required) {
      reporter.verbose(
        `Using installed adapter ${adapterToUse.module} inside .cache/adapters`
      )

      // TODO: double preferDefault is most ceirtainly wrong - figure it out
      return preferDefault(preferDefault(await import(required))) as AdapterInit
    }
  } catch (e) {
    installTimer.end()

    reporter.warn(
      `Could not install adapter ${adapterToUse.module}. Please install it yourself by adding it to your package.json's dependencies and try building your project again.`
    )
  }

  return undefined
}
