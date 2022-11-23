---
title: Creating Slugs for Pages
---

The logic for creating slugs from file names can get tricky, the `gatsby-source-filesystem` plugin ships with a function for creating them.

## Install

`npm install gatsby-source-filesystem`

## Create slugs in gatsby-node.js

Add your new slugs directly onto the `MarkdownRemark` nodes. Any data you add to nodes is available to query later with GraphQL.

To do so, you'll use a function passed to our API implementation called [`createNodeField`](/docs/reference/config-files/actions/#createNodeField). This function allows you to create additional fields on nodes created by other plugins.

```javascript:title=gatsby-node.js
const { createFilePath } = require(`gatsby-source-filesystem`)

// highlight-start
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  // highlight-end
  if (node.internal.type === `MarkdownRemark`) {
    // highlight-start
    const slug = createFilePath({ node, getNode, basePath: `pages` })
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
    // highlight-end
  }
}
```

## Query created slugs

Open refresh GraphiQL, then run this GraphQL query to see all your slugs:

```graphql
{
  allMarkdownRemark {
    edges {
      node {
        fields {
          slug
        }
      }
    }
  }
}
```
