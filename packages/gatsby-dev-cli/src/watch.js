const chokidar = require(`chokidar`)
const _ = require(`lodash`)
const fs = require(`fs-extra`)
const syspath = require(`path`)

const ignoreRegs = [/[\/\\]node_modules[\/\\]/i, /\.git/i, /[\/\\]src[\/\\]/i]
let numCopied = 0

const debouncedQuit = _.debounce(() => {
  console.log(`Copied ${numCopied} files`)
  process.exit()
}, 500)

function watch(root, packages, { scanOnce, quiet }) {
  packages.forEach(p => {
    const prefix = `${root}/packages/${p}`
    chokidar
      .watch(prefix, {
        ignored: [
          (path, stats) => {
            return _.some(ignoreRegs, reg => reg.test(path))
          },
        ],
      })
      .on(`all`, (event, path) => {
        if (event === `change` || event === `add`) {
          // Copy it over local version.
          const newPath = syspath.join(
            `./node_modules/${p}`,
            syspath.relative(prefix, path)
          )
          fs.copy(path, newPath, err => {
            if (err) {
              return console.error(err)
            }

            numCopied += 1
            if (!quiet) {
              console.log(`Copied ${path} to ${newPath}`)
            }
          })

          if (scanOnce) {
            debouncedQuit()
          }
        }
      })
  })
}

module.exports = watch
