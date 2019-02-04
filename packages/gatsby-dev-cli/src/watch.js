const chokidar = require(`chokidar`)
const _ = require(`lodash`)
const fs = require(`fs-extra`)
const path = require(`path`)

const { publishPackageLocally, registryUrl } = require(`./verdaccio`)
const { promisifiedSpawn } = require(`./utils`)

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

function difference(object, base) {
  function changes(object, base) {
    return _.transform(object, function(result, value, key) {
      if (!_.isEqual(value, base[key])) {
        result[key] =
          _.isObject(value) && _.isObject(base[key])
            ? changes(value, base[key])
            : value
      }
    })
  }
  return changes(object, base)
}

const installFromVerdaccio = async packages => {
  const installCmd = [
    `yarn`,
    [`add`, `--check-files`, `--registry=${registryUrl}`, ...packages],
  ]

  const outputList = packages.map(pkgName => `'${pkgName}'`).join(`, `)

  console.log(`Installing ${outputList} locally`, installCmd)

  await promisifiedSpawn(installCmd)

  console.log(`Installed ${outputList} locally`)
}

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

  const state = allPackagesToWatch.reduce((state, p) => {
    state[p] = {
      depsChanged: false,
      jobs: new Set(),
      // we need to know if package is direct dependency of the project to figure out if we need to
      // only publish it to local registry or install it as wll
      isDirectDep: packages.includes(p),
    }
    return state
  }, {})

  // const publishToVerdaccio = packages => {

  // }

  // const packagesToInstall = new Set()
  const packagesToPublish = new Set()

  const ignored = [
    /[/\\]node_modules[/\\]/i,
    /\.git/i,
    /\.DS_Store/,
    /[/\\]__tests__[/\\]/i,
  ].concat(packages.map(p => new RegExp(`${p}[\\/\\\\]src[\\/\\\\]`, `i`)))
  const watchers = _.uniq(
    allPackagesToWatch
      .map(p => path.join(root, `/packages/`, p))
      .filter(p => fs.existsSync(p))
  )

  let isInitialScan = true

  const getMonoRepoPkgJson = packageName => {
    const filePath = require.resolve(
      path.join(root, `packages`, packageName, `package.json`)
    )
    try {
      // Delete require cache so we can reload the module.
      delete require.cache[filePath]
      // eslint-disable-next-line
    } catch {}
    return require(filePath)
  }

  // const createPublishJob = packageName => {
  //   const pathToPackage = path.join(root, `/packages/`, packageName)

  //   return () =>
  //     publishPackageLocally({
  //       pathToPackage,
  //       packageName,
  //       version: getMonoRepoPkgJson(packageName).version,
  //     }).then(() => {
  //       // reset once we published, as then we want
  //       // to use file copying fast path
  //       state[packageName].depsChanged = false
  //     })
  // }

  // // let hack = false

  // const publishDeps = packageName => {
  //   // console.log(`publishing Deps`, {
  //   //   packageName,
  //   //   d: depTree[packageName],
  //   // })
  //   if (depTree[packageName]) {
  //     depTree[packageName].forEach(dependant => {
  //       addJob(dependant, createPublishJob(dependant), { isPublishJob: true })
  //     })

  //     // HACK: delete package in node_modules to force yarn to pull from local registry
  //     // console.log(`adding hack job for ${packageName}`)
  //     // hack = true
  //     addJob(
  //       packageName,
  //       () => {
  //         const packagePath = path.join(
  //           process.cwd(),
  //           `node_modules`,
  //           packageName
  //         )

  //         console.log(
  //           `HACK: deleting local ${packageName} files in node_modules`,
  //           { packagePath }
  //         )

  //         return fs.remove(packagePath)
  //       },
  //       {
  //         jobArgs: {
  //           isPublishJob: true,
  //           isHackJob: true,
  //         },
  //       }
  //     )
  //     // hack = false
  //   }
  // }

  // const addJob = (
  //   packageName,
  //   job,
  //   { isPublishJob = false, jobArgs = {} } = {}
  // ) => {
  //   if (isInitialScan && isPublishJob) {
  //     state[packageName].depsChanged = true
  //     state[packageName].jobs = state[packageName].jobs.filter(
  //       job => job.isPublishJob
  //     )

  //     // queue publishing
  //     state[packageName].jobs.push({
  //       job,
  //       isPublishJob,
  //       ...jobArgs,
  //     })

  //     // console.log(`adding publishing job`, {
  //     //   packageName,
  //     //   isDirectDep: state[packageName].isDirectDep,
  //     //   jobs: state[packageName].jobs,
  //     // })

  //     if (state[packageName].isDirectDep) {
  //       packagesToInstall.add(packageName)
  //     } else {
  //       publishDeps(packageName)
  //     }
  //     // if (depTree[packageName]) {
  //     //   // this is not direct dependency - need to make sure
  //     //   // we publish packages that depend on that
  //     //   // and install top-level dependency
  //     //   // depTree[packageName].forEach(dep => {})
  //     // }
  //   } else if (isPublishJob) {
  //     // package.json changed after initial scan
  //     // publish to registry and then install it

  //     job().then(() => {
  //       if (state[packageName].isDirectDep) {
  //         installFromVerdaccio([packageName])
  //       } else {
  //         publishDeps(packageName)
  //       }
  //     })
  //   } else if (isInitialScan) {
  //     // just file changed
  //     state[packageName].jobs.push({ job, ...jobArgs })
  //   } else if (isInitialScan) {
  //     job()
  //   }
  // }

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
          // compare dependencies with local version

          try {
            // Delete require cache so we can reload the module.
            delete require.cache[
              require.resolve(path.join(process.cwd(), newPath))
            ]
            // eslint-disable-next-line
          } catch {}

          const monorepoPKGjson = getMonoRepoPkgJson(packageName)

          // const monorepoPKGjson = require(filePath)

          let localPKGjson
          try {
            localPKGjson = require(path.join(process.cwd(), newPath))
          } catch {
            localPKGjson = {
              dependencies: {},
            }
          }

          const areDepsEqual = _.isEqual(
            monorepoPKGjson.dependencies,
            localPKGjson.dependencies
          )

          if (!areDepsEqual) {
            const diff = difference(
              monorepoPKGjson.dependencies,
              localPKGjson.dependencies
            )

            const diff2 = difference(
              localPKGjson.dependencies,
              monorepoPKGjson.dependencies
            )

            const depChangeLog = _.uniq(Object.keys({ ...diff, ...diff2 }))
              .reduce((acc, key) => {
                if (
                  localPKGjson.dependencies[key] &&
                  monorepoPKGjson.dependencies[key]
                ) {
                  acc.push(
                    ` - '${key}' changed version from ${
                      localPKGjson.dependencies[key]
                    } to ${monorepoPKGjson.dependencies[key]}`
                  )
                } else if (monorepoPKGjson.dependencies[key]) {
                  acc.push(
                    ` - '${key}@${monorepoPKGjson.dependencies[key]}' was added`
                  )
                } else {
                  acc.push(
                    ` - '${key}@${localPKGjson.dependencies[key]}' was removed`
                  )
                }
                return acc
              }, [])
              .join(`\n`)

            console.log(
              `Dependencies of '${packageName}' changed:\n${depChangeLog}`
            )

            // console.log({
            //   lp: path.join(process.cwd(), newPath),
            //   packageName,
            //   areDepsEqual,
            //   lDep: localPKGjson.dependencies,
            //   mDep: monorepoPKGjson.dependencies,
            //   // diff:
            // })

            // addJob(packageName, createPublishJob(packageName), {
            //   isPublishJob: true,
            // })

            if (isInitialScan) {
              state[packageName].jobs.clear()
              state[packageName].depsChanged = true
              packagesToPublish.add(packageName)
            } else {
            }

            return
          }
        }

        if (state[packageName].depsChanged) {
          // we are in middle of publishing to localy registry,
          // so we don't need to copy files as yarn will handle this
          return
        }

        const addJob = job => {
          if (isInitialScan) {
            state[packageName].jobs.add(() =>
              copyPath(filePath, newPath, quiet)
            )
          } else {
            copyPath(filePath, newPath, quiet)
          }
        }

        // console.log(`adding file ${packageName}/${filePath}`)

        // addJob(packageName, )

        // If this is from "cache-dir" also copy it into the site's .cache
        if (_.includes(filePath, `cache-dir`)) {
          const newCachePath = path.join(
            `.cache/`,
            path.relative(path.join(prefix, `cache-dir`), filePath)
          )
          addJob(packageName, () => copyPath(filePath, newCachePath, quiet))
        }
      }
    })
    .on(`ready`, async () => {
      isInitialScan = false

      // console.log(state[`gatsby-cli`])

      // actually run jobs
      const allJobs = _.flatten(
        Object.values(state).map(packageState => Array.from(packageState.jobs))
      )

      // console.log({ allJobs, packagesToInstall })
      // quit()

      await Promise.all(allJobs.map(job => job()))

      // need to install direct deps if any
      if (packagesToPublish.size) {
        console.log(`need to publish`, packagesToPublish)
        // await publishToVerdaccio(Array.from(packagesToPublish))
        //await installFromVerdaccio(Array.from(packagesToInstall))
      }

      if (scanOnce) {
        quit()
      }

      // console.log(allJobs)

      // quit()

      // all files watched, quit once all files are copied if necessary
      // Promise.all(allCopies).then(() => {
      //   if (scanOnce) {
      //     quit()
      //   }
      // })
    })
}

module.exports = watch
