const chokidar = require(`chokidar`)
const _ = require(`lodash`)
const fs = require(`fs-extra`)
const path = require(`path`)

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

function watch(root, packages, { scanOnce, quiet }) {
  const ignored = [
    /[/\\]node_modules[/\\]/i,
    /\.git/i,
    /\.DS_Store/,
  ].concat(
    packages.map(p => new RegExp(`${p}[\\/\\\\]src[\\/\\\\]`, `i`))
  )
  const watchers = packages.map(p => path.join(root, `/packages/`, p))

  let allCopies = []

  chokidar.watch(watchers, {
    ignored: [filePath => _.some(ignored, reg => reg.test(filePath))],
  })
    .on(`all`, (event, filePath) => {
      if (event === `change` || event === `add`) {
        const packageName = path.basename(path.dirname(filePath.split(`packages/`).pop()))
        const prefix = path.join(root, `/packages/`, packageName)

        // Copy it over local version.
        // Don't copy over the Gatsby bin file as that breaks the NPM symlink.
        if (_.includes(filePath, `dist/gatsby-cli.js`)) {
          return
        }

        const newPath = path.join(
          `./node_modules/${packageName}`,
          path.relative(prefix, filePath)
        )

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
    .on(`ready`, () => {
      // all files watched, quit once all files are copied if necessary
      Promise.all(allCopies).then(() => {
        if (scanOnce) {
          quit()
        }
      })
    })
}

module.exports = watch
