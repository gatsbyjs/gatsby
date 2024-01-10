const path = require(`path`)
const fs = require(`fs-extra`)

const { promisifiedSpawn } = require(`../utils/promisified-spawn`)
const { registryUrl } = require(`./verdaccio-config`)

const installPackages = async ({
  packagesToInstall,
  yarnWorkspaceRoot,
  newlyPublishedPackageVersions,
  externalRegistry,
  packageManager,
}) => {
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

    let workspacesLayout
    try {
      workspacesLayout = JSON.parse(JSON.parse(stdout).data)
    } catch (e) {
      /*
      Yarn 1.22 doesn't output pure json - it has leading and trailing text:
      ```
      $ yarn workspaces info --json
      yarn workspaces v1.22.0
      {
        "z": {
          "location": "z",
          "workspaceDependencies": [],
          "mismatchedWorkspaceDependencies": []
        },
        "y": {
          "location": "y",
          "workspaceDependencies": [],
          "mismatchedWorkspaceDependencies": []
        }
      }
      Done in 0.48s.
      ```
      So we need to do some sanitization. We find JSON by matching substring
      that starts with `{` and ends with `}`
    */

      const regex = /^[^{]*({.*})[^}]*$/gs
      const sanitizedStdOut = regex.exec(stdout)
      if (sanitizedStdOut?.length >= 2) {
        // pick content of first (and only) capturing group
        const jsonString = sanitizedStdOut[1]
        try {
          workspacesLayout = JSON.parse(jsonString)
        } catch (e) {
          console.error(
            `Failed to parse "sanitized" output of "yarn workspaces info" command.\n\nSanitized string: "${jsonString}`
          )
          // not exitting here, because we have general check for `workspacesLayout` being set below
        }
      }
    }

    if (!workspacesLayout) {
      console.error(
        `Couldn't parse output of "yarn workspaces info" command`,
        stdout
      )
      process.exit(1)
    }

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
    const yarnCommands = [`install`]

    if (!externalRegistry) {
      yarnCommands.push(`--registry=${registryUrl}`)
    }

    installCmd = [`yarn`, yarnCommands]
  } else {
    const packageAndVersionsToInstall = packagesToInstall.map(packageName => {
      const packageVersion = newlyPublishedPackageVersions[packageName]
      return `${packageName}@${packageVersion}`
    })

    if (packageManager === `pnpm`) {
      const pnpmCommands = [
        `add`,
        ...packageAndVersionsToInstall,
        `--save-exact`,
      ]

      if (!externalRegistry) {
        pnpmCommands.push(`--registry=${registryUrl}`)
      }

      installCmd = [`pnpm`, pnpmCommands]
    } else {
      const yarnCommands = [`add`, ...packageAndVersionsToInstall, `--exact`]

      if (!externalRegistry) {
        yarnCommands.push(`--registry=${registryUrl}`)
      }

      installCmd = [`yarn`, yarnCommands]
    }
  }

  try {
    await promisifiedSpawn(installCmd)

    console.log(`Installation complete`)
  } catch (error) {
    console.error(`Installation failed`, error)
    process.exit(1)
  }
}

exports.installPackages = installPackages
