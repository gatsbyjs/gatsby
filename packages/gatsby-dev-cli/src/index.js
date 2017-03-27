const chokidar = require("chokidar")
const _ = require("lodash")
const fs = require("fs-extra")
const syspath = require("path")

const ignoreRegs = [
  new RegExp(`\/node_modules\/`, "i"),
  new RegExp(`\.git`, "i"),
  new RegExp(`\/src\/`, "i"),
]

module.exports = (root, packages) => {
  packages.forEach(p => {
    const prefix = `${root}/packages/${p}`
    chokidar
      .watch(prefix, {
        ignored: [
          (path, stats) => {
            // console.log("path", path, stats);
            return _.some(ignoreRegs, reg => reg.test(path))
          },
        ],
      })
      .on("all", (event, path) => {
        if (event === "change" || event === "add") {
          // Copy it over local version.
          // console.log(syspath.relative(prefix, path));
          const newPath = syspath.join(
            `./node_modules/${p}`,
            syspath.relative(prefix, path)
          )
          // console.log("new path", newPath);
          fs.copySync(path, newPath)
          console.log(`copied ${path} to ${newPath}`)
        }
        // console.log(event, path);
      })
  })
}
