const fs = require(`fs`)
const path = require(`path`)
const { slash } = require(`gatsby-core-utils`)
const loaderUtils = require(`loader-utils`)
const { MDX_SCOPES_LOCATION } = require(`../constants`)

module.exports = function() {
  const { cache } = loaderUtils.getOptions(this)
  const abs = path.join(cache.directory, MDX_SCOPES_LOCATION)
  const files = fs.readdirSync(abs)
  // make webpack rebuild when new scopes are created
  this.addContextDependency(abs)
  return (
    files
      .map(
        (file, i) =>
          `var scope_${i} = require('${slash(path.join(abs, file))}').default;`
      )
      .join(`\n`) +
    `export default
        Object.assign({}, ${files.map((_, i) => `scope_` + i).join(`,\n`)} )
    `
  )
}
