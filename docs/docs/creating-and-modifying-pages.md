---
title: Creating and Modifying Pages
---

Gatsby makes it easy to programmatically control your pages.

Pages can be created in three ways:

- By creating React components in the `src/pages` directory. (Note that you must make the component the [default export](https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export).)
- By using the [File System Route API](/docs/reference/routing/file-system-route-api/) to programmatically create pages from GraphQL and to create client-only routes.
- In your site's `gatsby-node.js` file, by implementing the API [`createPages`](/docs/reference/config-files/gatsby-node/#createPages). ([Plugins](/docs/plugins/) can also implement `createPages` and create pages for you.)

Pages can also be modified by you after their creation. For example, you could change the `path` to create internationalized routes (see [gatsby-theme-i18n](https://github.com/gatsbyjs/themes/blob/1ddd07c4248239e6323833c6d6d572ac0a0d57a1/packages/gatsby-theme-i18n/gatsby-node.js#L132-L172) for instance) by implementing the API [`onCreatePage`](/docs/reference/config-files/gatsby-node/#onCreatePage).

> **Note:** For most use cases you'll be able to use the [File System Route API](/docs/reference/routing/file-system-route-api/) to create pages. Please read on if you need more control over the page creation or consume data outside of Gatsby's GraphQL data layer.

## Debugging help

To see what pages are being created by your code or plugins, you can query for
page information while developing in Graph<em>i</em>QL. Paste the following query in
the Graph<em>i</em>QL IDE for your site. The Graph<em>i</em>QL IDE is available when running
your site's development server at `HOST:PORT/___graphql` e.g.
`http://localhost:8000/___graphql`.

```graphql
{
  allSitePage {
    edges {
      node {
        path
        component
        pluginCreator {
          name
          pluginFilepath
        }
      }
    }
  }
}
```

The `context` property accepts an object, and you can pass in any data you want the page to be able to access.

You can also query for any `context` data you or plugins added to pages.

> **NOTE:** There are a few reserved names that _cannot_ be used in `context`. They are: `path`, `matchPath`, `component`, `componentChunkName`, `pluginCreator___NODE`, and `pluginCreatorId`.

## Creating pages in gatsby-node.js

Often you will need to programmatically create pages. For example, you have
markdown files where each should be a page.

This example assumes that each markdown page has a `path` set in the frontmatter
of the markdown file.

```javascript:title=gatsby-node.js
const path = require("path")

// Implement the Gatsby API “createPages”. This is called once the
// data layer is bootstrapped to let plugins create pages from data.
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Query for markdown nodes to use in creating pages.
  const result = await graphql(
    `
      {
        allMarkdownRemark(limit: 1000) {
          edges {
            node {
              frontmatter {
                path
              }
            }
          }
        }
      }
    `
  )

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`)
    return
  }

  // Create pages for each markdown file.
  const blogPostTemplate = path.resolve(`src/templates/blog-post.js`)
  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    const path = node.frontmatter.path
    createPage({
      path,
      component: blogPostTemplate,
      // In your blog post template's graphql query, you can use pagePath
      // as a GraphQL variable to query for data from the markdown file.
      context: {
        pagePath: path,
      },
    })
  })
}
```

## Trade-offs of querying for all fields in the context object of `gatsby-node.js`

Imagine a scenario where you could query for all the parameters your template would need in the `gatsby-node.js`. What would the implications be? In this section, you will look into this.

In the initial approach you have seen how the `gatsby-node.js` file would have a query block like so :

```graphql
  const queryResults = await graphql(`
    query AllProducts {
      allProducts {
        nodes {
          id
        }
      }
    }
  `);
```

Using the `id` as an access point to query for other properties in the template is the default approach. However, suppose you had a list of products with properties you would like to query for. Handling the query entirely from `gatsby-node.js` would result in the query looking like this:

```javascript:title=gatsby-node.js
const path = require("path")

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const queryResults = await graphql(`
    query AllProducts {
      allProducts {
        nodes {
          id
          name
          price
          description
        }
      }
    }
  `)

  const productTemplate = path.resolve(`src/templates/product.js`)
  queryResults.data.allProducts.nodes.forEach(node => {
    createPage({
      path: `/products/${node.id}`,
      component: productTemplate,
      context: {
        // This time the entire product is passed down as context
        product: node,
      },
    })
  })
}
```

> You are now requesting all the data you need in a single query (this requires server-side support to fetch many products in a single database query).

> As long as you can pass this data down to the template component via `pageContext`, there is no need for the template to make a GraphQL query at all.

Your template file would look like this:

```javascript:title=src/templates/product.js
function Product({ pageContext }) {
  const { product } = pageContext
  return (
    <div>
      Name: {product.name}
      Price: {product.price}
      Description: {product.description}
    </div>
  )
}
```

### Performance implications

Using the `pageContext` props in the template component can come with its performance advantages, of getting in all the data you need at build time; from the createPages API. This removes the need to have a GraphQL query in the template component.

It does come with the advantage of querying your data from one place after declaring the `context` parameter.

However, it doesn’t give you the opportunity to know what exactly you are querying for in the template and if any changes occur in the component query structure in `gatsby-node.js`. [Hot reload](/docs/glossary#hot-module-replacement) is taken off the table and the site needs to be rebuilt for changes to reflect.

Gatsby stores page metadata (including context) in a Redux store (which also means that it stores the memory of the page). For larger sites (either number of pages and/or amount of data that is being passed via page context) this will cause problems. There might be "out of memory" crashes if it's too much data or degraded performance.

> If there is memory pressure, Node.js will try to garbage collect more often, which is a known performance issue.

Page query results are not stored in memory permanently and are being saved to disk immediately after running the query.

We recommend passing "ids" or "slugs" and making full queries in the page template query to avoid this.

### Incremental builds trade-off of this method

Another disadvantage of querying all of your data in `gatsby-node.js` is that your site has to be rebuilt every time you make a change, so you will not be able to take advantage of incremental builds.

## Modifying pages created by core or plugins

Gatsby core and plugins can automatically create pages for you. Sometimes the
default isn't quite what you want and you need to modify the created page
objects.

### Configuring trailing slash behavior

As of `gatsby@4.7.0`, you now have the option of [removing, appending, or ignoring trailing slashes](/docs/reference/config-files/gatsby-config/#trailingslash).

### Pass context to pages

The automatically created pages can receive context and use that as variables in their GraphQL queries. To override the default and pass your own context, open your site's `gatsby-node.js` and add similar to the following:

```javascript:title=gatsby-node.js
exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions

  deletePage(page)
  // You can access the variable "house" in your page queries now
  createPage({
    ...page,
    context: {
      ...page.context,
      house: `Gryffindor`,
    },
  })
}
```

On your pages and templates, you can access your context via the prop `pageContext` like this:

```jsx
import React from "react"

const Page = ({ pageContext }) => {
  return <div>{pageContext.house}</div>
}

export default Page
```

Page context is serialized before being passed to pages. This means it can't be used to pass functions into components and `Date` objects will be serialized into strings.

## Optimizing pages for Content Sync

When using the [Content Sync](/docs/conceptual/content-sync) feature on Gatsby Cloud, an optional parameter, `ownerNodeId`, can be passed to the `createPage` action to allow greater control over where content is previewed. By passing a value to `ownerNodeId`, you can ensure that Content Sync will redirect content authors to the page they intend to preview their content on. The value of `ownerNodeId` should be set to the id of the node that's the preferred node to preview for each page. This is typically the id of the node that's used to create the page path for each page.

```javascript:title=gatsby-node.js
const posts = result.data.allPosts.nodes

posts.forEach((post) => {
  createPage({
    path: `/blog/${post.slug}/`,
    component: blogPost,
    context: {},
    ownerNodeId: post.id, // highlight-line
  })
})
```

## Creating client-only routes

In specific cases, you might want to create a site with client-only portions that are gated by authentication. For more on how to achieve this, refer to [client-only routes & user authentication](/docs/how-to/routing/client-only-routes-and-user-authentication/).
