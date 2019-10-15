const path = require(`path`)
const fs = require(`fs-extra`)

const { promisifiedSpawn } = require(`../utils/promisified-spawn`)
const { registryUrl } = require(`./verdaccio-config`)

const installPackages = async ({ packagesToInstall, yarnWorkspaceRoot }) => {
  console.log(
    `Installing packages from local registry:\n${packagesToInstall
      .map(packageAndVersion => ` - ${packageAndVersion}`)
      .join(`\n`)}`
  )
  let installCmd
  if (yarnWorkspaceRoot) {
    // this is very hacky - given root, we run `yarn workspaces info`
    // to get list of all workspaces and their locations, and manually
    // edit package.json file for packages we want to install
    // to make sure there are no mismatched versions of same package
    // in workspaces which should preserve node_modules structure
    // (packages being mostly hoisted to top-level node_modules)

    const { stdout } = await promisifiedSpawn([
      `yarn`,
      [`workspaces`, `info`, `--json`],
      { stdio: `pipe` },
    ])

    const workspacesLayout = JSON.parse(JSON.parse(stdout).data)

    const handleDeps = deps => {
      if (!deps) {
        return false
      }

      let changed = false
      Object.keys(deps).forEach(depName => {
        if (packagesToInstall.includes(depName)) {
          deps[depName] = `gatsby-dev`
          changed = true
        }
      })
      return changed
    }

    Object.keys(workspacesLayout).forEach(workspaceName => {
      const { location } = workspacesLayout[workspaceName]
      const pkgJsonPath = path.join(yarnWorkspaceRoot, location, `package.json`)
      if (!fs.existsSync(pkgJsonPath)) {
        return
      }
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, `utf8`))

      let changed = false
      changed |= handleDeps(pkg.dependencies)
      changed |= handleDeps(pkg.devDependencies)
      changed |= handleDeps(pkg.peerDependencies)

      if (changed) {
        console.log(`Changing deps in ${pkgJsonPath} to use @gatsby-dev`)
        fs.outputJSONSync(pkgJsonPath, pkg, {
          spaces: 2,
        })
      }
    })

    // package.json files are changed - so we just want to install
    // using verdaccio registry
    installCmd = [`yarn`, [`install`, `--registry=${registryUrl}`]]
  } else {
    installCmd = [
      `yarn`,
      [
        `add`,
        ...packagesToInstall.map(packageName => `${packageName}@gatsby-dev`),
        `--registry=${registryUrl}`,
        `--exact`,
      ],
    ]
  }

  try {
    await promisifiedSpawn(installCmd)

    console.log(`Installation complete`)
  } catch (error) {
    console.error(`Installation failed`, error)
  }
}

exports.installPackages = installPackages
