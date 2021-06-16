const paperwork = require("precinct").paperwork
const path = require(`path`)
const resolve = require(`resolve`)
const readPkgUp = require("read-pkg-up")
const requirePackageName = require("require-package-name")

const isLocalFile = filePath => filePath.slice(0, 1) === `.`

module.exports = filePath => {
  let dependencies = {}
  const localFilesToProcess = [filePath]

  while (localFilesToProcess.length) {
    const currentLocalFile = localFilesToProcess.pop()
    paperwork(currentLocalFile, { includeCore: false }).forEach(dep => {
      if (isLocalFile(dep)) {
        const abs = resolve.sync(dep, {
          basedir: path.dirname(currentLocalFile),
          extensions: [`.js`, `.mjs`, `.ts`],
        })

        localFilesToProcess.push(abs)
      } else {
        // This is probably a real package, try to resolve it.
        const moduleName = requirePackageName(dep.replace(/\\/, "/"))

        try {
          const pathToModule = resolve.sync(
            path.join(moduleName, "package.json"),
            {
              basedir: path.dirname(currentLocalFile),
              extensions: [`.js`, `.mjs`, `.ts`],
            }
          )
          const pkg = readPkgUp.sync({ cwd: pathToModule })

          if (pkg) {
            dependencies[moduleName] = pkg.packageJson.version
          }
        } catch (e) {
          if (e.code === "MODULE_NOT_FOUND") {
            try {
              // this resolves the requested import also against any set up NODE_PATH extensions, etc.
              const resolved = require.resolve(dep)
              localFilesToProcess.push(resolved)
              return
            } catch (e) {}
          }
        }
      }
    })
  }

  return dependencies
}
