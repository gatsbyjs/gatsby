---
title: "Creating and modifying pages"
---

Gatsby makes it easy to programatically control your pages.

Pages can be created in three ways:

* In your site's gatsby-node.js by implementing the API [`createPages`](/docs/node-apis/#createPages)
* Gatsby core automatically turns React components in `src/pages` into pages
* Plugins can also implement `createPages` and create pages for you

You can also implement the API [`onCreatePage`](/docs/node-apis/#onCreatePage) to
modify pages created in core or plugins or to create client-only pages.

## Debugging help

To see what pages are being created by your code or plugins, you can query
for page information while developing in Graph*i*QL. Paste the following
query in the Graph*i*QL IDE for your site. The Graph*i*QL IDE is available when running your sites development server at `HOST:PORT/___graphql` e.g. `localhost:8000/___graphql`.

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

You can also query for any `context` data you or plugins added to pages.

## Creating pages in gatsby-node.js

Often you will need to programmatically create pages. For example, you have
markdown files where each should be a page.

This example assumes that each markdown page has a "path" set in the frontmatter
of the markdown file.

```javascript
// Implement the Gatsby API “createPages”. This is called once the
// data layer is bootstrapped to let plugins create pages from data.
exports.createPages = ({ boundActionCreators, graphql }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    const blogPostTemplate = path.resolve(`src/templates/blog-post.js`)
    // Query for markdown nodes to use in creating pages.
    resolve(
      graphql(
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
      ).then(result => {
        if (result.errors) {
          reject(result.errors)
        }

        // Create pages for each markdown file.
        result.data.allMarkdownRemark.edges.forEach(({ node }) => {
          const path = node.frontmatter.path;
          createPage({
            path,
            component: blogPostTemplate,
            // In your blog post template's graphql query, you can use path
            // as a GraphQL variable to query for data from the markdown file.
            context: {
              path,
            }
          })
        })
      })
    )
  })
}
```

## Modifying pages created by core or plugins

Gatsby core and plugins can automatically create pages for you. Sometimes
the default isn't quite what you want and you need to modify the created
page objects.

### Removing trailing slashes
A common reason for needing to modify automatically created pages is to remove
trailing slashes.

To do this, in your site's `gatsby-node.js` add code
similar to the following:

```javascript
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = ({ page, boundActionCreators }) => {
  const { createPage, deletePage } = boundActionCreators

  return new Promise((resolve, reject) => {
    // Remove trailing slash
    const oldPath = page.path
    // Removing '/' would result in a path that's
    // an empty string which is invalid
    page.path = (page.path === `/`) ? page.path : page.path.replace(/\/$/, ``)
    if (page.path !== oldPath) {

      // Remove the old page
      deletePage({ path: oldPath })

      // Add the new page
      createPage(page)
    }

    resolve()
  })
}
```

### Creating client-only routes

If you're creating a "hybrid" Gatsby app with both statically rendered pages
as well as client-only routes e.g. an app that combines marketing pages and
your app that lives under `/app/*`, you want to add code to your `gatsby-node.js`
like the following:

```javascript
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    // page.matchPath is a special key that's used for matching pages
    // only on the client.
    if (page.path.match(/^\/app/)) {
      page.matchPath = "/app/:path"

      // Update the page.
      createPage(page)
    }

    resolve()
  })
}
```

### Changing layout

By default, Gatsby will apply the layout found at `/layouts/index.js` to all pages.
You may wish to have a custom layout for certain pages (such as removing header and footer for landing pages). You can change the template used using the `onCreatePage` API. Each template in the `/layouts/` directory will be available for use, with the key being its name without the file extension.

```javascript
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    if (page.path.match(/^\/landing-page/)) {
      // Assumed `landingPage.js` exists in the `/layouts/` directory
      page.layout = "landingPage"

      // Update the page.
      createPage(page)
    }

    resolve()
  })
}
```