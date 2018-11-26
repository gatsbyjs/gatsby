---
title: Creating slugs for pages
---

The logic for creating slugs from file names can get tricky, the `gatsby-source-filesystem` plugin ships with a function for creating them.

## Install

`npm install --save gatsby-source-filesystem`

## Create slugs in gatsby-node.js

Add your new slugs directly onto the `MarkdownRemark` nodes. Any data you add to nodes is available to query later with GraphQL.

To do so, you'll use a function passed to our API implementation called [`createNodeField`](/docs/bound-action-creators/#createNodeField). This function allows you to create additional fields on nodes created by other plugins.

```javascript{3,4,6-11}:title=gatsby-node.js
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` })
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
}
```

## Query created slugs

Open refresh Graph_i_QL, then run this GraphQL query to see all your slugs:

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
