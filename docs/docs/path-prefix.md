---
title: Adding a Path Prefix
---

Many applications are hosted at something other than the root (`/`) of their domain.

For example, a Gatsby blog could live at `example.com/blog/` or a site could be hosted on GitHub Pages at `example.github.io/my-gatsby-site/`

Each of these sites need a prefix added to all paths on the site. So a link to
`/my-sweet-blog-post/` should be rewritten to `/blog/my-sweet-blog-post`.

In addition links to various resources (JavaScript, CSS, images, and other static content) need the same prefix, so that the site continues to function and display correctly, even if served from this path prefix.

Let's get this functionality implemented. We'll add an option to our `gatsby-config.js`, and add a flag to our build command.

### Add to `gatsby-config.js`

```js:title=gatsby-config.js
module.exports = {
  pathPrefix: `/blog`,
}
```

### Build

Once the `pathPrefix` is specified in `gatsby-config.js`, we are well on our way to a prefixed app. The final step is to build out your application with a flag `--prefix-paths`, like so:

```shell
gatsby build --prefix-paths
```

If this flag is not passed, Gatsby will ignore your `pathPrefix` and build out your site as if it were hosted from the root domain.

### In-app linking

As a developer using this feature, it should be seamless. We provide APIs and libraries to make using this functionality a breeze. Specifically, the [`Link`](/docs/gatsby-link/) component has built-in functionality to handle path prefixing.

For example, if we want to link to our `/page-2` link (but the actual link will be prefixed, e.g. `/blog/page-2`) we don't want to hard code this path prefix in all of our links. We have your back! By using the `Link` component, we will automatically prefix your paths for you. If you later migrate off of `pathPrefix` your links will _still_ work seamlessly.

Let's look at a quick example.

```jsx:title=src/pages/index.js
import React from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"

function Index() {
  return (
    <Layout>
      {/* highlight-next-line */}
      <Link to="page-2">Page 2</Link>
    </Layout>
  )
}
```

Without doing _anything_ and merely using the `Link` component, this link will be prefixed with our specified `pathPrefix` in `gatsby-config.js`. Woo hoo!

If we want to do programatic/dynamic navigation, totally possible too! We expose a `navigate` helper, and this too automatically handles path prefixing.

```jsx:title=src/pages/index.js
import React from "react"
import { navigate } from "gatsby"
import Layout from "../components/layout"

export default function Index() {
  return (
    <Layout>
      {/* Note: this is an intentionally contrived example, but you get the idea! */}
      {/* highlight-next-line */}
      <button onClick={() => navigate("/page-2")}>
        Go to page 2, dynamically
      </button>
    </Layout>
  )
}
```

### Additional Considerations

The [`assetPrefix`](/docs/asset-prefix/) feature can be thought of as semi-related to this feature. That feature allows your assets (non-HTML files, e.g. images, JavaScript, etc.) to be hosted on a separate domain, for example a CDN.

This feature works seamlessly with `assetPrefix`. Build out your application with the `--prefix-paths` flag and you'll be well on your way to hosting an application with its assets hosted on a CDN, and its core functionality available behind a path prefix.
