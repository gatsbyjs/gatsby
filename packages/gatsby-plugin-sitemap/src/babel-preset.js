const { resolvePath } = require(`babel-plugin-module-resolver`)

const babelResolverPlugin = require.resolve(`babel-plugin-module-resolver`)

const resolvePackages = {
  pify: require.resolve(`pify`),
  minimatch: require.resolve(`minimatch`),
}
const resolvePatterns = Object.keys(resolvePackages).map(pkg => [
  pkg,
  chk => chk.replace(/\\/g, `/`).indexOf(`/${pkg}/`) > -1,
])

function resolveLocalAliasedPackages(sourcePath, currentFile, opts) {
  // Only run this resolution if the file that is being processed belongs
  // to this plugin
  if (!currentFile.startsWith(__dirname)) return null

  let resolvePackage = sourcePath

  // Is this a sourcePath we care about, or has it already been resolved?
  if (!(sourcePath in resolvePackages)) {
    // only resolve the current sourcePath if it wasn't resolved by this plugin
    // originally
    if (resolvePackage.startsWith(__dirname)) return null // we resolved it, return now

    // If this is a package we want to resolve, and it was resolved before, but not by
    // this plugin, then we need to change it to our path.
    const reResolve = resolvePatterns.some(([pkg, matches]) => {
      if (matches(sourcePath)) {
        resolvePackage = pkg
        return true
      }
      return false
    })

    // No more processing needed
    if (!reResolve) return null
  }

  // Pass it on to the babel plugin for resolving
  return resolvePath(resolvePackage, currentFile, opts)
}

module.exports = () => {
  return {
    plugins: [
      [
        babelResolverPlugin,
        {
          alias: resolvePackages,
          resolvePath: resolveLocalAliasedPackages,
        },
      ],
    ],
  }
}
