---
title: Gatsby Node APIs
description: Documentation on Node APIs used in Gatsby build process for common uses like creating pages
jsdoc: ["src/utils/api-node-docs.ts"]
apiCalls: NodeAPI
---

## Introduction

Gatsby gives plugins and site builders many APIs for controlling your site's data in the GraphQL data layer. Code in the file `gatsby-node.js` is run once in the process of building your site. You can use it to create pages dynamically, add nodes in GraphQL, or respond to events during the build lifecycle. To use the [Gatsby Node APIs](/docs/reference/config-files/gatsby-node/), create a file named `gatsby-node.js` in the root of your site. Export any of the APIs you wish to use in this file.

Every Gatsby Node API passes a [set of Node API helpers](/docs/reference/config-files/node-api-helpers/). These let you access several methods like reporting, or perform actions like creating new pages.

```js:title=gatsby-node.js
const path = require(`path`)
// Log out information after a build is done
exports.onPostBuild = ({ reporter }) => {
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
  `)
  result.data.allSamplePages.edges.forEach(edge => {
    createPage({
      path: `${edge.node.slug}`,
      component: blogPostTemplate,
      context: {
        title: edge.node.title,
      },
    })
  })
}
```

## Async plugins

If your plugin performs async operations (disk I/O, database access, calling remote APIs, etc.) you must either return a promise (explicitly using `Promise` API or implicitly using `async`/`await` syntax) or use the callback passed to the 3rd argument. Gatsby needs to know when plugins are finished as some APIs, to work correctly, require previous APIs to be complete first. See [Debugging Async Lifecycles](/docs/debugging-async-lifecycles/) for more info.

```javascript
// Async/await
exports.createPages = async () => {
  // do async work
  const result = await fetchExternalData()
}

// Promise API
exports.createPages = () => {
  return new Promise((resolve, reject) => {
    // do async work
  })
}

// Callback API
exports.createPages = (_, pluginOptions, cb) => {
  // do async work
  cb()
}
```

If your plugin does not do async work, you can return directly.

## Usage

Implement any of these APIs by exporting them from a file named `gatsby-node.js` in the root of your project.
