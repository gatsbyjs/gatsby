const chokidar = require(`chokidar`)
const _ = require(`lodash`)
const fs = require(`fs-extra`)
const path = require(`path`)

const {
  publishPackagesLocallyAndInstall,
  registryUrl,
  startVerdaccio,
} = require(`./local-npm-registry/verdaccio`)
// const { promisifiedSpawn } = require(`./local-npm-registry/utils`)
const { checkDepsChanges } = require(`./local-npm-registry/check-deps-changes`)
const {
  getDependantPackages,
} = require(`./local-npm-registry/get-dependant-packages`)

let numCopied = 0

const quit = () => {
  console.log(`Copied ${numCopied} files`)
  process.exit()
}

const copyPath = (oldPath, newPath, quiet) =>
  new Promise((resolve, reject) => {
    fs.copy(oldPath, newPath, err => {
      if (err) {
        console.error(err)
        return reject(err)
      }

      numCopied += 1
      if (!quiet) {
        console.log(`Copied ${oldPath} to ${newPath}`)
      }
      return resolve()
    })
  })

const traversePackagesDeps = ({
  root,
  packages,
  monoRepoPackages,
  seenPackages = [...packages],
  depTree = {},
}) => {
  packages.forEach(p => {
    const pkgJson = require(path.join(root, `packages`, p, `package.json`))

    const fromMonoRepo = _.intersection(
      Object.keys({ ...pkgJson.dependencies }),
      monoRepoPackages
    )

    fromMonoRepo.forEach(pkgName => {
      if (!depTree[pkgName]) {
        depTree[pkgName] = new Set()
      }
      depTree[pkgName].add(p)
    })

    // only traverse not yet seen packages to avoid infinite loops
    const newPackages = _.difference(fromMonoRepo, seenPackages)

    if (newPackages.length) {
      newPackages.forEach(depFromMonorepo => {
        seenPackages.push(depFromMonorepo)
      })

      traversePackagesDeps({
        root,
        packages,
        monoRepoPackages,
        seenPackages,
        depTree,
      })
    }
  })
  return { seenPackages, depTree }
}

/*
 * non-existant packages break on('ready')
 * See: https://github.com/paulmillr/chokidar/issues/449
 */
function watch(root, packages, { scanOnce, quiet, monoRepoPackages }) {
  // check packages deps and if they depend on other packages from monorepo
  // add them to packages list
  const { seenPackages: allPackagesToWatch, depTree } = traversePackagesDeps({
    root,
    packages,
    monoRepoPackages,
  })

  // nice DX would be to  start `yarn watch --scope={${allPackagesToWatch}.join(`,)}`
  // probably behind some flag or configstore setting as we needed to run those

  const ignored = [
    /[/\\]node_modules[/\\]/i,
    /\.git/i,
    /\.DS_Store/,
    /[/\\]__tests__[/\\]/i,
  ].concat(
    allPackagesToWatch.map(p => new RegExp(`${p}[\\/\\\\]src[\\/\\\\]`, `i`))
  )
  const watchers = _.uniq(
    allPackagesToWatch
      .map(p => path.join(root, `/packages/`, p))
      .filter(p => fs.existsSync(p))
  )

  let allCopies = []
  const packagesToPublish = new Set()
  let isInitialScan = true

  chokidar
    .watch(watchers, {
      ignored: [filePath => _.some(ignored, reg => reg.test(filePath))],
    })
    .on(`all`, (event, filePath) => {
      const watchEvents = [`change`, `add`]
      if (_.includes(watchEvents, event)) {
        const [packageName] = filePath
          .split(/packages[/\\]/)
          .pop()
          .split(/[/\\]/)
        const prefix = path.join(root, `/packages/`, packageName)

        // Copy it over local version.
        // Don't copy over the Gatsby bin file as that breaks the NPM symlink.
        if (_.includes(filePath, `dist/gatsby-cli.js`)) {
          return
        }

        const relativePackageFile = path.relative(prefix, filePath)

        const newPath = path.join(
          `./node_modules/${packageName}`,
          relativePackageFile
        )

        if (relativePackageFile === `package.json`) {
          // Compare dependencies with local version
          if (checkDepsChanges({ newPath, packageName, root, isInitialScan })) {
            //
            if (isInitialScan) {
              // handle dependency change only in initial scan - this is for sure doable to
              // handle this in watching mode correctly - but for the sake of shipping
              // this I limit more work/time consuming edge cases.

              // Dependency changed - now we need to figure out
              // the packages that actually need to be published.
              // If package with changed dependencies is dependency of other
              // gatsby package - like for example `gatsby-plugin-page-creator`
              // we need to publish both `gatsby-plugin-page-creator` and `gatsby`
              // and install `gatsby` in example site project.
              getDependantPackages({
                packageName,
                depTree,
                packages,
              }).forEach(packageToPublish => {
                // scheduling publish - we will publish when `ready` is emitted
                // as we can do single publish then
                packagesToPublish.add(packageToPublish)
              })

              return
            } else {
              console.warn(
                `Installation of depenencies after initial scan is not implemented`
              )
            }
          }
        }

        if (packagesToPublish.has(packageName)) {
          // we are in middle of publishing to localy registry,
          // so we don't need to copy files as yarn will handle this
          return
        }

        let localCopies = [copyPath(filePath, newPath, quiet)]

        // If this is from "cache-dir" also copy it into the site's .cache
        if (_.includes(filePath, `cache-dir`)) {
          const newCachePath = path.join(
            `.cache/`,
            path.relative(path.join(prefix, `cache-dir`), filePath)
          )
          localCopies.push(copyPath(filePath, newCachePath, quiet))
        }

        allCopies = allCopies.concat(localCopies)
      }
    })
    .on(`ready`, async () => {
      if (isInitialScan && packagesToPublish.size > 0) {
        const publishAndInstallPromise = publishPackagesLocallyAndInstall({
          packagesToPublish: Array.from(packagesToPublish),
          root,
          packages,
        })
        packagesToPublish.clear()
        allCopies.push(publishAndInstallPromise)
      }

      isInitialScan = false

      // all files watched, quit once all files are copied if necessary
      Promise.all(allCopies).then(() => {
        if (scanOnce) {
          quit()
        }
      })
    })
}

module.exports = watch
