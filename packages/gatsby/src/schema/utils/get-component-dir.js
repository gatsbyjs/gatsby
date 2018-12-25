const path = require(`path`)

const getComponentDir = source => {
  if (!source) return null

  // TODO: should be on context, not source
  const { componentPath } = source
  return componentPath && path.dirname(componentPath)
}

module.exports = getComponentDir
