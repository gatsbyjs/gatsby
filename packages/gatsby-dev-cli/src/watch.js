const chokidar = require(`chokidar`)
const _ = require(`lodash`)
const fs = require(`fs-extra`)
const syspath = require(`path`)

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
  const watchers = packages.map(p => syspath.join(root, `/packages/`, p))

  let allCopies = []

  chokidar.watch(watchers, {
    ignored: [(path, stats) => _.some(ignored, reg => reg.test(path))],
  })
    .on(`all`, (event, path) => {
      if (event === `change` || event === `add`) {
        const name = syspath.basename(syspath.dirname(path.split(`packages/`).pop()))
        const prefix = syspath.join(root, `/packages/`, name)

        // Copy it over local version.
        // Don't copy over the Gatsby bin file as that breaks the NPM symlink.
        if (_.includes(path, `dist/gatsby-cli.js`)) {
          return
        }

        const newPath = syspath.join(
          `./node_modules/${name}`,
          syspath.relative(prefix, path)
        )

        let localCopies = [copyPath(path, newPath, quiet)]

        // If this is from "cache-dir" also copy it into the site's .cache
        if (_.includes(path, `cache-dir`)) {
          const newCachePath = syspath.join(
            `.cache/`,
            syspath.relative(syspath.join(prefix, `cache-dir`), path)
          )
          localCopies.push(copyPath(path, newCachePath, quiet))
        }

        allCopies = allCopies.concat(localCopies)
      }
    })
    .on(`ready`, () => {
      Promise.all(allCopies).then(() => {
        if (scanOnce) {
          quit()
        }
      })
    })
}

module.exports = watch
