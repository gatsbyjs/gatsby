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

const installFromVerdaccio = async args => {
  await publishPackageLocally(args)

  const installCmd = [
    `yarn`,
    [`add`, args.packageName, `--registry=${registryUrl}`],
  ]

  console.log(`Installing '${args.packageName}' locally`)

  await promisifiedSpawn(installCmd)

  console.log(`Installed '${args.packageName}' locally`)
}

/*
 * non-existant packages break on('ready')
 * See: https://github.com/paulmillr/chokidar/issues/449
 */
function watch(root, packages, { scanOnce, quiet }) {
  const ignored = [/[/\\]node_modules[/\\]/i, /\.git/i, /\.DS_Store/].concat(
    packages.map(p => new RegExp(`${p}[\\/\\\\]src[\\/\\\\]`, `i`))
  )
  const watchers = _.uniq(
    packages
      .map(p => path.join(root, `/packages/`, p))
      .filter(p => fs.existsSync(p))
  )

  let allCopies = []

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
            delete require.cache[require.resolve(filePath)]
            // eslint-disable-next-line
          } catch {}
          try {
            // Delete require cache so we can reload the module.
            delete require.cache[
              require.resolve(path.join(process.cwd(), newPath))
            ]
            // eslint-disable-next-line
          } catch {}

          const monorepoPKGjson = require(filePath)

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
            allCopies.push(
              installFromVerdaccio({
                pathToPackage: prefix,
                packageName,
                version: monorepoPKGjson.version,
              })
            )
          }

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
    .on(`ready`, () =>
      // all files watched, quit once all files are copied if necessary
      Promise.all(allCopies).then(() => {
        if (scanOnce) {
          quit()
        }
      })
    )
}

module.exports = watch
