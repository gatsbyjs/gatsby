const chokidar = require(`chokidar`)
const _ = require(`lodash`)
const fs = require(`fs-extra`)
const syspath = require(`path`)

let numCopied = 0

const debouncedQuit = _.debounce(() => {
  console.log(`Copied ${numCopied} files`)
  process.exit()
}, 500)

const copyPath = (oldPath, newPath, quiet) => {
  fs.copy(oldPath, newPath, err => {
    if (err) {
      return console.error(err)
    }

    numCopied += 1
    if (!quiet) {
      console.log(`Copied ${oldPath} to ${newPath}`)
    }
  })
}

function watch(root, packages, { scanOnce, quiet }) {
  packages.forEach(p => {
    const prefix = syspath.join(root, `/packages/`, p)

    const ignoreRegs = [
      /[\/\\]node_modules[\/\\]/i,
      /\.git/i,
      new RegExp(`${p}[\\/\\\\]src[\\/\\\\]`, `i`),
    ]

    chokidar
      .watch(prefix, {
        ignored: [(path, stats) => _.some(ignoreRegs, reg => reg.test(path))],
      })
      .on(`all`, (event, path) => {
        if (event === `change` || event === `add`) {
          // Copy it over local version.

          // Don't copy over the Gatsby bin file as that breaks the NPM symlink.
          if (_.includes(path, `dist/gatsby-cli.js`)) {
            return
          }

          const newPath = syspath.join(
            `./node_modules/${p}`,
            syspath.relative(prefix, path)
          )

          copyPath(path, newPath, quiet)

          // If this is from "cache-dir" also copy it into the site's .cache
          if (_.includes(path, `cache-dir`)) {
            const newCachePath = syspath.join(
              `.cache/`,
              syspath.relative(syspath.join(prefix, `cache-dir`), path)
            )
            copyPath(path, newCachePath, quiet)
          }

          if (scanOnce) {
            debouncedQuit()
          }
        }
      })
  })
}

module.exports = watch
