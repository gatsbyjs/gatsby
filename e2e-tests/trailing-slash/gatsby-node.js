const posts = [
  {
    id: 1,
    slug: `/with/`,
    title: `With Trailing Slash`,
    content: `With Trailing Slash`,
  },
  {
    id: 2,
    slug: `/without`,
    title: `Without Trailing Slash`,
    content: `Without Trailing Slash`,
  },
  {
    id: 3,
    slug: `/`,
    title: `Index page`,
    content: `This is an index page`,
  },
]

exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions

  posts.forEach(post => {
    createNode({
      ...post,
      id: createNodeId(`post-${post.id}`),
      _id: post.id,
      parent: null,
      children: [],
      internal: {
        type: `Post`,
        content: JSON.stringify(post),
        contentDigest: createContentDigest(post),
      },
    })
  })
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`#graphql
    type Post implements Node {
      id: ID!
      slug: String!
      title: String!
      content: String!
    }
  `)
}

const templatePath = require.resolve(`./src/templates/template.js`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      allPost {
        nodes {
          slug
        }
      }
    }
  `)

  result.data.allPost.nodes.forEach(node => {
    createPage({
      path: `/create-page${node.slug}`,
      component: templatePath,
      context: {
        slug: node.slug,
      },
    })
  })
}
