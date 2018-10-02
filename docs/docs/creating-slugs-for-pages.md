---
title: Creating slugs for pages
---

Creating new pages has two steps:

1.  Generate the "path" or "slug" for the page.
2.  Create the page.

_**Note**: Often data sources will directly provide a slug or pathname for content — when working with one of those systems (e.g. a CMS), you don't need to create the slugs yourself like you do with markdown files._

To create your markdown pages, you'll learn to use two Gatsby APIs
[`onCreateNode`](/docs/node-apis/#onCreateNode) and
[`createPages`](/docs/node-apis/#createPages). These are two workhorse APIs
you'll see used in many sites and plugins.

We do our best to make Gatsby APIs simple to implement. To implement an API, you export a function
with the name of the API from `gatsby-node.js`.

So let's do that. In the root of your site, create a file named
`gatsby-node.js`. Then add the following.

```javascript:title=gatsby-node.js
exports.onCreateNode = ({ node }) => {
  console.log(node.internal.type)
}
```

This `onCreateNode` function will be called by Gatsby whenever a new node is created (or updated).

Stop and restart the development server. As you do, you'll see quite a few newly
created nodes get logged to the terminal console.

Let's use this API to add the slugs for your markdown pages to `MarkdownRemark`
nodes.

Change your function so it now only logs `MarkdownRemark` nodes.

```javascript{2-4}:title=gatsby-node.js
exports.onCreateNode = ({ node }) => {
  if (node.internal.type === `MarkdownRemark`) {
    console.log(node.internal.type)
  }
}
```

You want to use each markdown file name to create the page slug. So
`pandas-and-bananas.md` will become `/pandas-and-bananas/`. But how do you get
the file name from the `MarkdownRemark` node? To get it, you need to _traverse_
the "node graph" to its _parent_ `File` node, as `File` nodes contain data you
need about files on disk. To do that, modify your function again:

```javascript{1,3-4}:title=gatsby-node.js
exports.onCreateNode = ({ node, getNode }) => {
  if (node.internal.type === `MarkdownRemark`) {
    const fileNode = getNode(node.parent)
    console.log(`\n`, fileNode.relativePath)
  }
}
```

There in your terminal you should see the relative paths for your two markdown
files.

![markdown-relative-path](markdown-relative-path.png)

Now let's create slugs. As the logic for creating slugs from file names can get
tricky, the `gatsby-source-filesystem` plugin ships with a function for creating
slugs. Let's use that.

```javascript{1,5}:title=gatsby-node.js
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, getNode }) => {
  if (node.internal.type === `MarkdownRemark`) {
    console.log(createFilePath({ node, getNode, basePath: `pages` }))
  }
}
```

The function handles finding the parent `File` node along with creating the
slug. Run the development server again and you should see logged to the terminal
two slugs, one for each markdown file.

Now let's add your new slugs directly onto the `MarkdownRemark` nodes. This is
powerful, as any data you add to nodes is available to query later with GraphQL.
So it'll be easy to get the slug when it comes time to create the pages.

To do so, you'll use a function passed to our API implementation called
[`createNodeField`](/docs/bound-action-creators/#createNodeField). This function
allows you to create additional fields on nodes created by other plugins. Only
the original creator of a node can directly modify the node—all other plugins
(including your `gatsby-node.js`) must use this function to create additional
fields.

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

Restart the development server and open or refresh Graph_i_QL. Then run this
GraphQL query to see your new slugs.

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

Now that the slugs are created, you can create the pages.