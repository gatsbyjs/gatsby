---
title: "Creating and modifying pages"
---

Gatsby makes it easy to programatically control your pages.

Pages can be created in three ways:

* In your site code by implementing the API `createPages`
* Gatsby core automatically turns React compnents in `src/pages` into pages
* Plugins can also implement `createPages` and create pages for you

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
// Implement the Gatsby API “onUpsertPage”. This is
// called after every page is created.
exports.onUpsertPage = ({ page, boundActionCreators }) => {
  const { upsertPage, deletePageByPath } = boundActionCreators

  return new Promise((resolve, reject) => {
    // Remove trailing slash
    const oldPath = page.path
    page.path = page.path.replace(/\/$/, "")
    if (page.path !== oldPath) {

      // Remove the old page
      deletePageByPath(oldPath)

      // Add the new page
      upsertPage(page)
    }

    resolve()
  }
}
```

### Creating client-only routes

If you're creating a "hybrid" Gatsby app with both statically rendered pages
as well as client-only routes e.g. an app that combines marketing pages and
your app that lives under `/app/*`, you want to add code to your `gatsby-node.js`
like the following:

```javascript
// Implement the Gatsby API “onUpsertPage”. This is
// called after every page is created.
exports.onUpsertPage = async ({ page, boundActionCreators }) => {
  const { upsertPage, deletePageByPath } = boundActionCreators

  return new Promise((resolve, reject) => {
    // page.matchPath is a special key that's used for matching pages
    // only on the client.
    if (page.path.match(/^\/app/)) {
      page.matchPath = "/app/:path"

      // Update the page.
      upsertPage(page)
    }

    resolve()
  }
}
```

## Creating pages

Often you will need to programmatically create pages. For example, you have
markdown files that each should be a page.

TODO finish this once it's more settled how to modify nodes to add slugs and
other special fields that we want to associate with a node. Perhaps `addFieldToNode`.
