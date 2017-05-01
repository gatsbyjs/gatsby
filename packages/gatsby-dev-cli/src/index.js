const chokidar = require(`chokidar`)
const _ = require(`lodash`)
const fs = require(`fs-extra`)
const syspath = require(`path`)

const ignoreRegs = [/[\/\\]node_modules[\/\\]/i, /\.git/i, /[\/\\]src[\/\\]/i]

let copied = 0
const debouncedQuit = _.debounce(() => {
  console.log(`gatsby-dev copied ${copied} files`)
  process.exit()
}, 500)

module.exports = (root, packages, { scanOnce, quiet }) => {
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
          // Make any directories that are needed.
          fs.ensureFileSync(newPath)
          fs.copy(path, newPath, err => {
            if (err) console.error(err)
            copied += 1
            if (!quiet) {
              console.log(`copied ${path} to ${newPath}`)
            }
          })

          if (scanOnce) {
            debouncedQuit()
          }
        }
      })
  })
}
