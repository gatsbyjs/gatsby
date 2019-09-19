---
title: The gatsby-node.js API file
---

The file `gatsby-node.js` contains code that is run once when your site is built. You can use it to create pages dynamically, create nodes in GraphQL, or respond to events while Gatsby is building your site. Use any of the [Gatsby Node APIs](/docs/node-apis/) by exporting them in a file named `gatsby-node.js` in the root of your site.

Every Node API passes a [set of Node API helpers](/docs/node-api-helpers/). These let you access several methods like reporting, or perform actions like creating new pages.

```jsx:title=gatsby-node.js
const path = require(`path`)
// Log out information after a build is done
exports.onPostBuild = ({reporter}) => {
  reporter.info(`Your Gatsby site has been built!`)
}
// Create blog pages dynamically
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const blogPostTemplate = path.resolve(`src/templates/blog-post.js`)
  const result = await graphql(`
    query {
      allSamplePages {
        edges {
          node {
            slug
            title
          }
        }
      }
    }
  `
  result.data.allSamplePages.edges.forEach(edge => {
    createPage({
      path: `${edge.node.slug}`,
      component: blogPostTemplate,
      context: {
        title: edge.node.title
      },
    })
  })
}
```
