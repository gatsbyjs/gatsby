const startVerdaccio = require(`verdaccio`).default
const path = require(`path`)
const npmLogin = require(`npm-cli-login`)
const fs = require(`fs-extra`)
const { promisifiedSpawn } = require(`./utils`)

let VerdaccioInitPromise = null

const verdaccioConfig = {
  storage: path.join(__dirname, `..`, `verdaccio`, `storage`),
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

exports.publishPackageLocally = async ({
  pathToPackage,
  packageName,
  version,
}) => {
  // <ake sure verdaccio is running
  await startServer()

  // npm unpublish
  // because version doesn't change when developing locally verdaccio wouldn't
  // let republish package with same version - so as quick workaround we
  // unpublish package.
  // Ideally we could check if we need to unpublish: i.e. compare deps of
  // published package to deps of package in monorepo.
  // Also for CI we could make special case to skip this, because then
  // there is no way to edit source files and we can use fast path.
  const unpublishCmd = [
    `npm`,
    [`unpublish`, `${packageName}@${version}`, `--registry=${registryUrl}`],
  ]

  console.log(
    `Trying to unpublish ${packageName}@${version} to local registry, in case it was published before`
  )
  try {
    await promisifiedSpawn(unpublishCmd)
    console.log(`Unpublished ${packageName}@${version} from local registry`)
  } catch {
    console.log(
      `Didn't unpublish ${packageName}@${version} - probably package wasn't published before`
    )
  }

  // npm publish
  const publishCmd = [
    `npm`,
    [`publish`, `--registry=${registryUrl}`],
    {
      cwd: pathToPackage,
    },
  ]

  console.log(`Publishing ${packageName}@${version} to local registry`)

  await promisifiedSpawn(publishCmd)

  console.log(`Published ${packageName}@${version} to local registry`)
}
