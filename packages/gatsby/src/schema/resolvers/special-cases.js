const path = require(`path`)

const { getBaseDir, getComponentDir, getParentNode } = require(`../utils`)

const convert = (relativePath, baseDir) => {
  switch (typeof relativePath) {
    case `string`:
      return path.join(baseDir, relativePath)
    case `object`:
      if (Array.isArray(relativePath)) {
        return relativePath.map(p => path.join(baseDir, p))
      } else if (relativePath) {
        return Object.entries(relativePath).reduce((acc, [operator, p]) => {
          acc[operator] = convert(p, baseDir)
          return acc
        }, {})
      }
  }
  return null
}

const toAbsolutePath = (relativePath, source, isRootQuery) => {
  const baseDir = isRootQuery
    ? getComponentDir(source)
    : getBaseDir(getParentNode(source))
  return baseDir && convert(relativePath, baseDir)
}

const withSpecialCases = ({ type, source, args, context, info }) => {
  switch (type) {
    case `File`:
      if (args.filter && source) {
        if (args.filter.relativePath) {
          const absolutePath = toAbsolutePath(
            args.filter.relativePath,
            source,
            // FIXME: For now, keep v2 behavior
            false
            // info.parentType && info.parentType.name === `Query`
          )
          if (absolutePath) {
            delete args.filter.relativePath
            args.filter.absolutePath = absolutePath
          }
        } else if (args.filter.relativeDirectory) {
          const absoluteDirectory = toAbsolutePath(
            args.filter.relativeDirectory,
            source,
            // FIXME: For now, keep v2 behavior
            false
            // info.parentType && info.parentType.name === `Query`
          )
          if (absoluteDirectory) {
            delete args.filter.relativeDirectory
            args.filter.absoluteDirectory = absoluteDirectory
          }
        }
      }
      break
    default:
    //noop
  }
  return args
}

module.exports = withSpecialCases
