import start from "verdaccio"

import fs from "fs-extra"
// eslint-disable-next-line @typescript-eslint/naming-convention
import _ from "lodash"

let VerdaccioInitPromise: Promise<unknown> | null = null

import { verdaccioConfig } from "./verdaccio-config"
import { publishPackage } from "./publish-package"
import { installPackages } from "./install-packages"

export function startVerdaccio(): Promise<unknown> | null {
  if (VerdaccioInitPromise) {
    return VerdaccioInitPromise
  }

  console.log(`Starting local verdaccio server`)

  // clear storage
  fs.removeSync(verdaccioConfig.storage)

  VerdaccioInitPromise = new Promise(resolve => {
    start(
      verdaccioConfig,
      verdaccioConfig.port.toString(),
      verdaccioConfig.storage,
      `1.0.0`,
      `gatsby-dev`,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (webServer, addr, _pkgName, _pkgVersion) => {
        // console.log(webServer)
        webServer.listen(addr.port || addr.path, addr.host, () => {
          console.log(`Started local verdaccio server`)

          resolve(undefined)
        })
      },
    )
  })

  return VerdaccioInitPromise
}

export async function publishPackagesLocallyAndInstall({
  packagesToPublish,
  localPackages,
  packageNameToPath,
  ignorePackageJSONChanges,
  yarnWorkspaceRoot,
  externalRegistry,
  root,
  packageManager,
}: {
  packagesToPublish: Array<string>
  localPackages: Array<string>
  packageNameToPath: Map<string, string>
  ignorePackageJSONChanges: (
    packageName: string,
    strings: [string, string],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => any
  yarnWorkspaceRoot?: string | null | undefined
  externalRegistry: boolean
  root: string
  packageManager: "pnpm" | "npm"
}): Promise<void> {
  await startVerdaccio()

  const versionPostFix = Date.now()

  const newlyPublishedPackageVersions = {}

  for (const packageName of packagesToPublish) {
    newlyPublishedPackageVersions[packageName] = await publishPackage({
      packageName,
      packagesToPublish,
      packageNameToPath,
      versionPostFix,
      ignorePackageJSONChanges,
      root,
    })
  }

  const packagesToInstall: Array<string> = _.intersection(
    packagesToPublish,
    localPackages,
  )

  await installPackages({
    packagesToInstall,
    yarnWorkspaceRoot,
    newlyPublishedPackageVersions,
    externalRegistry,
    packageManager,
  })
}
