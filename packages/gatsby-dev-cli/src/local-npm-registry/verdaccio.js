const startVerdaccio = require(`verdaccio`).default
const path = require(`path`)
const npmLogin = require(`npm-cli-login`)
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
  auth: {
    htpasswd: {
      file: `./.htpasswd`,
      max_users: 1000,
    },
  },
  logs: [{ type: `stdout`, format: `pretty-timestamped`, level: `warn` }],
  packages: {
    "**": {
      access: `$all`,
      publish: `gatsby-dev`, // we create dummy gatsby-dev username
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

          // Login with dummy gatsby-dev user - see  ./verdaccio/.htpasswd .
          // This is needed to be able to actually publish packages
          // to local registry.
          console.log(`Logging in with dummy user`)

          npmLogin(
            `gatsby-dev`,
            `gatsby-dev`,
            `gatsby-dev@gatsbyjs.org`,
            registryUrl
          )

          // This is silly - `npm-cli-login` doesn't return promise or callback
          // so let's just wait reasaonable amount before resolving
          // There is open pull request to add returning promise:
          // https://github.com/postmanlabs/npm-cli-login/pull/19
          setTimeout(() => {
            console.log(`Hopefully logged in already`)
            resolve()
          }, 1500)
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
}) => {
  // we need to check if package depend on any other package to will be published and
  // adjust version selector to point to dev version of package so local registry is used
  // for dependencies.

  const monoRepoPackageJsonPath = getMonorepoPackageJsonPath({
    packageName,
    root,
  })
  const monorepoPKGjsonString = fs.readFileSync(monoRepoPackageJsonPath)
  const monorepoPKGjson = JSON.parse(monorepoPKGjsonString)

  monorepoPKGjson.version = `${monorepoPKGjson.version}-dev-${versionPostFix}`
  packagesToPublish.forEach(packageThatWillBePublished => {
    if (monorepoPKGjson.dependencies[packageThatWillBePublished]) {
      // change to "gatsby-dev" dist tag
      monorepoPKGjson.dependencies[packageThatWillBePublished] = `gatsby-dev`
    }
  })

  // change version and dependency versions
  fs.outputJSONSync(monoRepoPackageJsonPath, monorepoPKGjson)

  const pathToPackage = path.dirname(monoRepoPackageJsonPath)

  // npm publish
  const publishCmd = [
    `npm`,
    [`publish`, `--tag`, `gatsby-dev`, `--registry=${registryUrl}`],
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
}

exports.publishPackagesLocallyAndInstall = async ({
  packagesToPublish,
  packages,
  root,
}) => {
  await startServer()

  const versionPostFix = Date.now()

  for (let packageName of packagesToPublish) {
    await publishPackage({
      packageName,
      packagesToPublish,
      root,
      versionPostFix,
    })
  }

  const packagesToInstall = _.intersection(packagesToPublish, packages).map(
    packageName => `${packageName}@gatsby-dev`
  )
  const installCmd = [
    `yarn`,
    [`add`, ...packagesToInstall, `--registry=${registryUrl}`],
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
