const startVerdaccio = require(`verdaccio`).default
const path = require(`path`)
const fs = require(`fs-extra`)
const _ = require(`lodash`)
const { promisifiedSpawn, getMonorepoPackageJsonPath } = require(`./utils`)

let VerdaccioInitPromise = null

const verdaccioConfig = {
  storage: path.join(__dirname, `..`, `..`, `verdaccio`, `storage`),
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
  self_path: path.join(__dirname, `..`, `verdaccio`),
}

const registryUrl = `http://localhost:${verdaccioConfig.port}`

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

const publishPackage = async ({
  packageName,
  packagesToPublish,
  root,
  versionPostFix,
  ignorePackageJSONChanges,
}) => {
  // we need to check if package depend on any other package to will be published and
  // adjust version selector to point to dev version of package so local registry is used
  // for dependencies.

  const monoRepoPackageJsonPath = getMonorepoPackageJsonPath({
    packageName,
    root,
  })
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

  const pathToPackage = path.dirname(monoRepoPackageJsonPath)

  // npm publish
  const publishCmd = [
    `yarn`,
    [
      `publish`,
      `--tag`,
      `gatsby-dev`,
      `--registry=${registryUrl}`,
      `--new-version`,
      monorepoPKGjson.version,
    ],
    {
      cwd: pathToPackage,
    },
  ]

  console.log(
    `Publishing ${packageName}@${monorepoPKGjson.version} to local registry`
  )
  try {
    await promisifiedSpawn(publishCmd)

    console.log(
      `Published ${packageName}@${monorepoPKGjson.version} to local registry`
    )
  } catch {
    console.error(`Failed to publish ${packageName}@${monorepoPKGjson.version}`)
  }

  // restore original package.json
  fs.outputFileSync(monoRepoPackageJsonPath, monorepoPKGjsonString)
  unignorePackageJSONChanges()
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
    {
      cwd: process.cwd(),
    },
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
