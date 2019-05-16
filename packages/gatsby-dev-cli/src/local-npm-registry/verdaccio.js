const startVerdaccio = require(`verdaccio`).default
const path = require(`path`)
const fs = require(`fs-extra`)
const _ = require(`lodash`)
const os = require(`os`)

const {
  getMonorepoPackageJsonPath,
} = require(`../utils/get-monorepo-package-json-path`)
const { promisifiedSpawn } = require(`../utils/promisified-spawn`)
const { registerCleanupTask } = require(`./cleanup-tasks`)

let VerdaccioInitPromise = null

const verdaccioConfig = {
  storage: path.join(os.tmpdir(), `verdaccio`, `storage`),
  port: 4873, // default
  web: {
    enable: true,
    title: `gatsby-dev`,
  },
  logs: [{ type: `stdout`, format: `pretty-timestamped`, level: `warn` }],
  packages: {
    "**": {
      access: `$all`,
      publish: `$all`,
      proxy: `npmjs`,
    },
  },
  uplinks: {
    npmjs: {
      url: `https://registry.npmjs.org/`,
    },
  },
}

const registryUrl = `http://localhost:${verdaccioConfig.port}`
const NPMRCContent = `${registryUrl.replace(
  /https?:/g,
  ``
)}/:_authToken="gatsby-dev"`

exports.registryUrl = registryUrl

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

/**
 * Edit package.json to:
 *  - adjust version to temporary one
 *  - change version selectors for dependencies that
 *    will be published, to make sure that yarn
 *    install them in local site
 */
const adjustPackageJson = ({
  monoRepoPackageJsonPath,
  packageName,
  versionPostFix,
  packagesToPublish,
  ignorePackageJSONChanges,
}) => {
  // we need to check if package depend on any other package to will be published and
  // adjust version selector to point to dev version of package so local registry is used
  // for dependencies.

  const monorepoPKGjsonString = fs.readFileSync(
    monoRepoPackageJsonPath,
    `utf-8`
  )
  const monorepoPKGjson = JSON.parse(monorepoPKGjsonString)

  monorepoPKGjson.version = `${monorepoPKGjson.version}-dev-${versionPostFix}`
  packagesToPublish.forEach(packageThatWillBePublished => {
    if (
      monorepoPKGjson.dependencies &&
      monorepoPKGjson.dependencies[packageThatWillBePublished]
    ) {
      // change to "gatsby-dev" dist tag
      monorepoPKGjson.dependencies[packageThatWillBePublished] = `gatsby-dev`
    }
  })

  const temporaryMonorepoPKGjsonString = JSON.stringify(monorepoPKGjson)

  const unignorePackageJSONChanges = ignorePackageJSONChanges(packageName, [
    monorepoPKGjsonString,
    temporaryMonorepoPKGjsonString,
  ])

  // change version and dependency versions
  fs.outputFileSync(monoRepoPackageJsonPath, temporaryMonorepoPKGjsonString)

  return {
    newPackageVersion: monorepoPKGjson.version,
    unadjustPackageJson: registerCleanupTask(() => {
      // restore original package.json
      fs.outputFileSync(monoRepoPackageJsonPath, monorepoPKGjsonString)
      unignorePackageJSONChanges()
    }),
  }
}

/**
 * Anonymous publishing require dummy .npmrc
 * See https://github.com/verdaccio/verdaccio/issues/212#issuecomment-308578500
 * This is `npm publish` (as in linked comment) and `yarn publish` requirement.
 * This is not verdaccio restriction.
 */
const createTemporaryNPMRC = ({ pathToPackage }) => {
  const NPMRCPath = path.join(pathToPackage, `.npmrc`)
  fs.outputFileSync(NPMRCPath, NPMRCContent)

  return registerCleanupTask(() => {
    fs.removeSync(NPMRCPath)
  })
}

const publishPackage = async ({
  packageName,
  packagesToPublish,
  root,
  versionPostFix,
  ignorePackageJSONChanges,
}) => {
  const monoRepoPackageJsonPath = getMonorepoPackageJsonPath({
    packageName,
    root,
  })

  const { unadjustPackageJson, newPackageVersion } = adjustPackageJson({
    monoRepoPackageJsonPath,
    packageName,
    root,
    versionPostFix,
    packagesToPublish,
    ignorePackageJSONChanges,
  })

  const pathToPackage = path.dirname(monoRepoPackageJsonPath)

  const uncreateTemporaryNPMRC = createTemporaryNPMRC({ pathToPackage })

  // npm publish
  const publishCmd = [
    `npm`,
    [`publish`, `--tag`, `gatsby-dev`, `--registry=${registryUrl}`],
    {
      cwd: pathToPackage,
    },
  ]

  console.log(
    `Publishing ${packageName}@${newPackageVersion} to local registry`
  )
  try {
    await promisifiedSpawn(publishCmd)

    console.log(
      `Published ${packageName}@${newPackageVersion} to local registry`
    )
  } catch {
    console.error(`Failed to publish ${packageName}@${newPackageVersion}`)
  }

  uncreateTemporaryNPMRC()
  unadjustPackageJson()
}

exports.publishPackagesLocallyAndInstall = async ({
  packagesToPublish,
  packages,
  root,
  ignorePackageJSONChanges,
}) => {
  await startServer()

  const versionPostFix = Date.now()

  for (let packageName of packagesToPublish) {
    await publishPackage({
      packageName,
      packagesToPublish,
      root,
      versionPostFix,
      ignorePackageJSONChanges,
    })
  }

  const packagesToInstall = _.intersection(packagesToPublish, packages).map(
    packageName => `${packageName}@gatsby-dev`
  )
  const installCmd = [
    `yarn`,
    [`add`, ...packagesToInstall, `--registry=${registryUrl}`, `--exact`],
  ]

  console.log(
    `Installing packages from local registry:\n${packagesToInstall
      .map(packageAndVersion => ` - ${packageAndVersion}`)
      .join(`\n`)}`
  )

  try {
    await promisifiedSpawn(installCmd)

    console.log(`Installation complete`)
  } catch {
    console.error(`Installation failed`)
  }
}
