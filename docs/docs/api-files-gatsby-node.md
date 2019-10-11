---
title: The gatsby-node.js API file
---

Code in the file `gatsby-node.js` is run once in the process of building your site. You can use it to create pages dynamically, add nodes in GraphQL, or respond to events during the build lifecycle. To use the [Gatsby Node APIs](/docs/node-apis/), create a file named `gatsby-node.js` in the root of your site. Export any of the APIs you wish to use in this file.

Every Gatsby Node API passes a [set of Node API helpers](/docs/node-api-helpers/). These let you access several methods like reporting, or perform actions like creating new pages.

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
