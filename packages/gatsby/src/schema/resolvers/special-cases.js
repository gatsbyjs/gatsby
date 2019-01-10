const path = require(`path`)

const { getBaseDir, getComponentDir, getParentNode } = require(`../utils`)

// FIXME: vs. current behavior of relativePath!?!?
// TODO: `relativeDirectory`

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
      if (args.filter && args.filter.relativePath && source) {
        const absolutePath = toAbsolutePath(
          args.filter.relativePath,
          source,
          info.parentType && info.parentType.name === `Query`
        )
        delete args.filter.relativePath
        args.filter.absolutePath = absolutePath
      }
      break
    default:
    //noop
  }
  return args
}

module.exports = withSpecialCases
