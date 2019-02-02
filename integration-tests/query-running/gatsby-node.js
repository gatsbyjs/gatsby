const nodes = require(`./nodes-data`)
const runQueries = require(`./run-queries`)

exports.onPreInit = ({ reporter }) => {
  reporter.info(`Building with GATSBY_DB_NODES=${process.env.GATSBY_DB_NODES}`)
}

exports.sourceNodes = ({ actions, createContentDigest }) => {
  const { createNode } = actions

  nodes.forEach(node => {
    node.internal.contentDigest = createContentDigest(node)
    createNode(node)
  })
}

exports.createPages = async ({ graphql }) => {
  await runQueries(graphql)
}
