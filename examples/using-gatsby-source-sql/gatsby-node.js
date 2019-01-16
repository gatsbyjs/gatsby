/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

var unified = require(`unified`)
var markdown = require(`remark-parse`)
var html = require(`remark-html`)
const path = require(`path`)

exports.onCreateNode = async ({ node, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `Article`) {
    console.log(node.title)
    await unified()
      .use(markdown)
      .use(html)
      .process(node.body)
      .then(res => {
        createNodeField({
          node,
          name: `html`,
          value: res.contents,
        })
      })
  }
}

exports.createPages = ({ graphql, actions }) => {
  // **Note:** The graphql function call returns a Promise
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise for more info
  const { createPage } = actions
  return graphql(`
    {
      allArticle {
        edges {
          node {
            slug
          }
        }
      }
    }
  `).then(result => {
    result.data.allArticle.edges.forEach(({ node }) => {
      createPage({
        path: node.slug,
        component: path.resolve(`./src/templates/article.js`),
        context: {
          // Data passed to context is available
          // in page queries as GraphQL variables.
          slug: node.slug,
        },
      })
    })
  })
}
