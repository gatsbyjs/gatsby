const paperwork = require(`precinct`).paperwork
const path = require(`path`)
const { promisify } = require(`util`)
const _resolve = require(`resolve`)
const readPkgUp = require(`read-pkg-up`)
const requirePackageName = require(`require-package-name`)
const fs = require(`fs-extra`)
const crypto = require(`crypto`)

const resolve = promisify(_resolve)

async function getFileHash(filePath) {
  const str = await fs.readFile(filePath)
  const shasum = crypto.createHash(`sha1`)
  shasum.update(str)
  return shasum.digest(`hex`)
}

const isLocalFile = filePath => filePath.slice(0, 1) === `.`
async function getDependencies(root, filePath) {
  const absFilePath = path.join(root, filePath)
  const seenFiles = new Set()
  const dependencies = {}
  const localFilesToProcess = [absFilePath]

  dependencies[filePath] = await getFileHash(absFilePath)

  while (localFilesToProcess.length) {
    const currentLocalFile = localFilesToProcess.pop()
    await Promise.all(
      paperwork(currentLocalFile, { includeCore: false }).map(async dep => {
        // Handle
        if (seenFiles.has(dep)) {
          return
        }
        seenFiles.add(dep)
        if (isLocalFile(dep)) {
          const abs = await resolve(dep, {
            basedir: path.dirname(currentLocalFile),
            extensions: [`.js`, `.mjs`, `.ts`],
          })

          dependencies[`./` + path.relative(root, abs)] = await getFileHash(abs)
          localFilesToProcess.push(abs)
        } else {
          // This is probably a real package, try to resolve it.
          const moduleName = requirePackageName(dep.replace(/\\/, `/`))

          try {
            const pathToModule = await resolve(
              path.join(moduleName, `package.json`),
              {
                basedir: path.dirname(currentLocalFile),
                extensions: [`.js`, `.mjs`, `.ts`],
              }
            )
            const pkg = await readPkgUp({ cwd: pathToModule })

            if (pkg) {
              dependencies[moduleName] = pkg.packageJson.version
            }
          } catch (e) {
            if (e.code === `MODULE_NOT_FOUND`) {
              try {
                // this resolves the requested import also against any set up NODE_PATH extensions, etc.
                const resolved = require.resolve(dep)
                dependencies[
                  `./` + path.relative(root, resolved)
                ] = await getFileHash(resolved)
                localFilesToProcess.push(resolved)
                return
              } catch (e) {
                // ignore
              }
            }
          }
        }
      })
    )
  }

  return dependencies
}

export default getDependencies
