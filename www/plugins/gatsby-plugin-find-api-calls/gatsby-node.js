const path = require(`path`)
const findApiCalls = require(`./find-api-calls`)

exports.sourceNodes = ({
  actions,
  createNodeId,
  createContentDigest,
  reporter,
}) => {
  const { createNode } = actions

  const searchPath = path.join(process.cwd(), `../`)

  const globRegex = `${searchPath}**/*.js`

  console.log(`path`, searchPath)
  console.log(`glob`, globRegex)

  const buckets = findApiCalls(globRegex)

  console.log(buckets)
}
