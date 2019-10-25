---
title: Creating and Modifying Pages
---

Gatsby makes it easy to programmatically control your pages.

Pages can be created in three ways:

- In your site's gatsby-node.js by implementing the API
  [`createPages`](/docs/node-apis/#createPages)
- Gatsby core automatically turns React components in `src/pages` into pages
- Plugins can also implement `createPages` and create pages for you

You can also implement the API [`onCreatePage`](/docs/node-apis/#onCreatePage)
to modify pages created in core or plugins or to create [client-only routes](/docs/building-apps-with-gatsby/).

## Debugging help

To see what pages are being created by your code or plugins, you can query for
page information while developing in Graph*i*QL. Paste the following query in
the Graph*i*QL IDE for your site. The Graph*i*QL IDE is available when running
your sites development server at `HOST:PORT/___graphql` e.g.
`localhost:8000/___graphql`.

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

The `context` property accepts an object, and we can pass in any data we want the page to be able to access.

You can also query for any `context` data you or plugins added to pages.

> **NOTE:** There are a few reserved names that _cannot_ be used in `context`. They are: `path`, `matchPath`, `component`, `componentChunkName`, `pluginCreator___NODE`, and `pluginCreatorId`.

## Creating pages in gatsby-node.js

Often you will need to programmatically create pages. For example, you have
markdown files where each should be a page.

This example assumes that each markdown page has a `path` set in the frontmatter
of the markdown file.

```javascript:title=gatsby-node.js
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
      // In your blog post template's graphql query, you can use path
      // as a GraphQL variable to query for data from the markdown file.
      context: {
        path,
      },
    })
  })
}
```

## Modifying pages created by core or plugins

Gatsby core and plugins can automatically create pages for you. Sometimes the
default isn't quite what you want and you need to modify the created page
objects.

### Removing trailing slashes

A common reason for needing to modify automatically created pages is to remove
trailing slashes.

To do this, in your site's `gatsby-node.js` add code similar to the following:

_Note: There's also a plugin that will remove all trailing slashes from pages automatically:
[gatsby-plugin-remove-trailing-slashes](/packages/gatsby-plugin-remove-trailing-slashes/)_.

_Note: If you need to perform an asynchronous action within `onCreatePage` you can return a promise or use an `async` function._

```javascript:title=gatsby-node.js
// Replacing '/' would result in empty string which is invalid
const replacePath = path => (path === `/` ? path : path.replace(/\/$/, ``))
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions

  const oldPage = Object.assign({}, page)
  // Remove trailing slash unless page is /
  page.path = replacePath(page.path)
  if (page.path !== oldPage.path) {
    // Replace new page with old page
    deletePage(oldPage)
    createPage(page)
  }
}
```

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

Page context is serialized before being passed to pages: This means it can't be used to pass functions into components.

## Creating Client-only routes

In specific cases, you might want to create a site with client-only portions that are gated by authentication. For more on how to achieve this, refer to [client-only routes & user authentication](https://www.gatsbyjs.org/docs/client-only-routes-and-user-authentication/).
