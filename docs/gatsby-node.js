const docs = require('./src/docs-util')

exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions

  docs.sourceNodes({ actions: { createTypes } })
}

exports.createResolvers = async ({ createResolvers, reporter }) => {
  await docs.createResolvers({ createResolvers })
}

exports.onCreateNode = async ({
  node,
  getNode,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) => {
  const { createNodeField, createNode, createParentChildLink } = actions

  const slug =
    node.internal.type === `Mdx` &&
    getNode(node.parent).sourceInstanceName === `docs`
      ? createFilePath({
          node,
          getNode,
        })
      : node.slug

  // assign fields to MDX nodes based on where they came from
  if (
    node.internal.type === `Mdx` &&
    getNode(node.parent).sourceInstanceName === `gatsbyjs`
  ) {
    const relPath = getNode(node.parent).relativePath
    createNodeField({
      node,
      name: `relPath`,
      value: relPath,
    })

    // TODO
    let ossSlug = createPath(relPath)
    ossSlug = ossSlug.slice(5)

    createNodeField({
      node,
      name: `slug`,
      value: ossSlug,
    })
    createNodeField({
      node,
      name: `ossDoc`,
      value: true,
    })
  }

  await docs.onCreateNode({
    node,
    actions: { createNode, createParentChildLink, createNodeField },
    getNode,
    loadNodeContent,
    createNodeId,
    createContentDigest,
  })
}

exports.createPages = async ({
  graphql,
  actions: { createPage, createRedirect },
}) => {
  await docs.createPages({ graphql, actions: { createPage } })
}
