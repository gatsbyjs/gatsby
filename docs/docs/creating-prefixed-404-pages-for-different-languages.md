---
title: Creating Prefixed 404 Pages for Different Languages
---

Using the [`onCreatePage`](/docs/reference/config-files/gatsby-node/#onCreatePage) API in your project's `gatsby-node.js` file, it's possible to create different 404 pages for different URL prefixes, such as `/en/`).

Here is an example that shows you how to create an English 404 page at `src/pages/en/404.js`, and a German 404 page at `/src/pages/de/404.js`:

```jsx:title=src/pages/en/404.js
import React from "react"
import Layout from "../../components/layout"

export default function NotFound() {
  return (
    <Layout>
      <h1>Page Not Found</h1>
      <p>Oops, we couldn't find this page!</p>
    </Layout>
  )
}
```

```jsx:title=src/pages/de/404.js
import React from "react"
import Layout from "../../components/layout"

export default function NotFound() {
  return (
    <Layout>
      <h1>Seite nicht gefunden</h1>
      <p>Ups, wir konnten diese Seite nicht finden!</p>
    </Layout>
  )
}
```

Now, open up your project's `gatsby-node.js` and add the following code:

```javascript:title=gatsby-node.js
exports.onCreatePage = async ({ page, actions }) => {
  const { createPage, deletePage } = actions

  // Check if the page is a localized 404
  if (page.path.match(/^\/[a-z]{2}\/404\/$/)) {
    const oldPage = { ...page }

    // Get the language code from the path, and match all paths
    // starting with this code (apart from other valid paths)
    const langCode = page.path.split(`/`)[1]
    page.matchPath = `/${langCode}/*`

    // Recreate the modified page
    deletePage(oldPage)
    createPage(page)
  }
}
```

Now, whenever Gatsby creates a page, it will check if the page is a localized 404 with a path in the format of `/XX/404/`. If this is the case, then it will get the language code, and match all paths starting with this code, apart from other valid paths. This means that whenever you visit a non-existent page on your site, whose path starts with `/en/` or `/de/` (e.g. `/en/this-does-not-exist`), your localized 404 page will be displayed instead.

For best results, you should configure your server to serve these 404 pages in the same manner - i.e. for `/en/<non existent path>`, your server should serve the page `/en/404/`. Otherwise, you'll briefly see the default 404 page until the Gatsby runtime loads. If you're using Netlify, you can use [`gatsby-plugin-netlify`](/plugins/gatsby-plugin-netlify/) to do this automatically. Note that you should still create a default 404 page (usually at `src/pages/404.js`) to handle non-prefixed paths, e.g. `https://example.com/this-does-not-exist`.
