import { readFileSync, outputFileSync, removeSync } from "fs-extra"
import { join, dirname } from "path"

import { registryUrl } from "./verdaccio-config"
import { registerCleanupTask } from "./cleanup-tasks"
import { promisifiedSpawn } from "../utils/promisified-spawn"
import { getMonorepoPackageJsonPath } from "../utils/get-monorepo-package-json-path"
import type { PackageJson } from "../../../gatsby"

const NPMRCContent = `${registryUrl.replace(
  /https?:/g,
  ``,
)}/:_authToken="gatsby-dev"`

/**
 * Edit package.json to:
 *  - adjust version to temporary one
 *  - change version selectors for dependencies that
 *    will be published, to make sure that pnpm
 *    install them in local site
 */
function adjustPackageJson({
  monoRepoPackageJsonPath,
  packageName,
  versionPostFix,
  packagesToPublish,
  ignorePackageJSONChanges,
  packageNameToPath,
}: {
  monoRepoPackageJsonPath: string
  packageName: string
  versionPostFix: number
  packagesToPublish: Array<string>
  ignorePackageJSONChanges: (
    packageName: string,
    strings: [string, string],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => any
  packageNameToPath: Map<string, string>
}): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newPackageVersion: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unadjustPackageJson: () => any
} {
  // we need to check if package depend on any other package to will be published and
  // adjust version selector to point to dev version of package so local registry is used
  // for dependencies.

  const monorepoPKGjsonString = readFileSync(monoRepoPackageJsonPath, `utf-8`)
  const monorepoPKGjson = JSON.parse(monorepoPKGjsonString) as PackageJson

  monorepoPKGjson.version = `${monorepoPKGjson.version}-dev-${versionPostFix}`
  packagesToPublish.forEach(packageThatWillBePublished => {
    if (
      monorepoPKGjson.dependencies &&
      monorepoPKGjson.dependencies[packageThatWillBePublished]
    ) {
      const packagePath = getMonorepoPackageJsonPath({
        packageName: packageThatWillBePublished,
        packageNameToPath,
      })

      const file = readFileSync(packagePath, `utf-8`)

      const currentVersion = (JSON.parse(file) as PackageJson).version

      monorepoPKGjson.dependencies[packageThatWillBePublished] =
        `${currentVersion}-dev-${versionPostFix}`
    }
  })

  const temporaryMonorepoPKGjsonString = JSON.stringify(monorepoPKGjson)

  const unignorePackageJSONChanges = ignorePackageJSONChanges(packageName, [
    monorepoPKGjsonString,
    temporaryMonorepoPKGjsonString,
  ])

  // change version and dependency versions
  outputFileSync(monoRepoPackageJsonPath, temporaryMonorepoPKGjsonString)

  return {
    newPackageVersion: monorepoPKGjson.version,
    unadjustPackageJson: registerCleanupTask(() => {
      // restore original package.json
      outputFileSync(monoRepoPackageJsonPath, monorepoPKGjsonString)
      unignorePackageJSONChanges()
    }),
  }
}

/**
 * Anonymous publishing require dummy .npmrc
 * See https://github.com/verdaccio/verdaccio/issues/212#issuecomment-308578500
 * This is `pnpm publish` (as in linked comment) and `pnpm publish` requirement.
 * This is not verdaccio restriction.
 */
function createTemporaryNPMRC({
  pathToPackage,
  root,
}: {
  pathToPackage: string
  root: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): () => any {
  const NPMRCPathInPackage = join(pathToPackage, `.npmrc`)
  outputFileSync(NPMRCPathInPackage, NPMRCContent)

  const NPMRCPathInRoot = join(root, `.npmrc`)
  outputFileSync(NPMRCPathInRoot, NPMRCContent)

  return registerCleanupTask(() => {
    removeSync(NPMRCPathInPackage)
    removeSync(NPMRCPathInRoot)
  })
}

export async function publishPackage({
  packageName,
  packagesToPublish,
  versionPostFix,
  ignorePackageJSONChanges,
  packageNameToPath,
  root,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: {
  root: string
  packageName: string
  packagesToPublish: Array<string>
  versionPostFix: number
  packageNameToPath: Map<string, string>
  ignorePackageJSONChanges: (
    packageName: string,
    strings: [string, string],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> {
  const monoRepoPackageJsonPath = getMonorepoPackageJsonPath({
    packageName,
    packageNameToPath,
  })

  const { unadjustPackageJson, newPackageVersion } = adjustPackageJson({
    monoRepoPackageJsonPath,
    packageName,
    packageNameToPath,
    versionPostFix,
    packagesToPublish,
    ignorePackageJSONChanges,
  })

  const pathToPackage = dirname(monoRepoPackageJsonPath)

  const uncreateTemporaryNPMRC = createTemporaryNPMRC({ pathToPackage, root })

  // npm publish
  const publishCmd = [
    `npm`,
    [`publish`, `--tag`, `gatsby-dev`, `--registry=${registryUrl}`],
    {
      cwd: pathToPackage,
    },
  ] satisfies [string, Array<string>, { cwd: string }]

  console.log(
    `Publishing ${packageName}@${newPackageVersion} to local registry`,
  )
  try {
    await promisifiedSpawn(publishCmd)

    console.log(
      `Published ${packageName}@${newPackageVersion} to local registry`,
    )
  } catch (e) {
    console.error(`Failed to publish ${packageName}@${newPackageVersion}`, e)
    process.exit(1)
  }

  uncreateTemporaryNPMRC()
  unadjustPackageJson()

  return newPackageVersion
}
