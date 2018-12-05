const glob = require(`glob`)
const reporter = require(`gatsby-cli/lib/reporter`)
const apiList = require(`./api-config-docs`)

// const hasAPIFile = plugin => glob.sync(`${plugin.resolve}/gatsby-config*`)[0]

module.exports = async (api, path) => {
  // Check that the API is documented.
  if (!apiList[api]) {
    reporter.panic(`api: "${api}" is not a valid Gatsby api`)
  }
}
