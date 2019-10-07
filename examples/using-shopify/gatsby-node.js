const path = require(`path`)
const limax = require(`limax`)

exports.onCreateNode = function onCreateNode({ actions, node }) {
  if (node.internal.type === `ShopifyProduct`) {
    actions.createNodeField({
      node,
      name: `slug`,
      value: `/products/${limax(node.title)}`,
    })
  }
}

exports.createPages = async function createPages({ actions, graphql }) {
  const result = await graphql(`
    {
      allShopifyProduct {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw new Error(result.errors)
  }

  const productTemplate = path.resolve(`src/templates/product.js`)

  result.data.allShopifyProduct.edges.forEach(({ node }) => {
    const { slug } = node.fields
    actions.createPage({
      component: productTemplate,
      path: slug,
      context: {
        slug,
      },
    })
  })
}
