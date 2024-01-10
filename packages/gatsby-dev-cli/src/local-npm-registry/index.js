const startVerdaccio = require(`verdaccio`).default

const fs = require(`fs-extra`)
const _ = require(`lodash`)

let VerdaccioInitPromise = null

const { verdaccioConfig } = require(`./verdaccio-config`)
const { publishPackage } = require(`./publish-package`)
const { installPackages } = require(`./install-packages`)

const startServer = () => {
  if (VerdaccioInitPromise) {
    return VerdaccioInitPromise
  }

  console.log(`Starting local verdaccio server`)

  // clear storage
  fs.removeSync(verdaccioConfig.storage)

  VerdaccioInitPromise = new Promise(resolve => {
    startVerdaccio(
      verdaccioConfig,
      verdaccioConfig.port,
      verdaccioConfig.storage,
      `1.0.0`,
      `gatsby-dev`,
      (webServer, addr, pkgName, pkgVersion) => {
        // console.log(webServer)
        webServer.listen(addr.port || addr.path, addr.host, () => {
          console.log(`Started local verdaccio server`)

          resolve()
        })
      }
    )
  })

  return VerdaccioInitPromise
}

exports.startVerdaccio = startServer

exports.publishPackagesLocallyAndInstall = async ({
  packagesToPublish,
  localPackages,
  packageNameToPath,
  ignorePackageJSONChanges,
  yarnWorkspaceRoot,
  externalRegistry,
  root,
  packageManager,
}) => {
  await startServer()

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

  const packagesToInstall = _.intersection(packagesToPublish, localPackages)

  await installPackages({
    packagesToInstall,
    yarnWorkspaceRoot,
    newlyPublishedPackageVersions,
    externalRegistry,
    packageManager,
  })
}
