---
title: The gatsby-ssr.js API file
---

The file `gatsby-ssr.js` lets you alter the content of static HTML files as they are being Server-Side Rendered (SSR) by Gatsby and Node.js. To use the [Gatsby SSR APIs](/docs/ssr-apis/), create a file called `gatsby-ssr.js` in the root of your site. Export any of the APIs you wish to use in this file.

The APIs `wrapPageElement` and `wrapRootElement` exist in both the SSR and [browser APIs](/docs/browser-apis). If you use one of them, consider if you should implement it in both `gatsby-ssr.js` and `gatsby-browser.js` so that pages generated through SSR with Node.js are the same after being [hydrated](/docs/glossary#hydration) with browser JavaScript.

```jsx:title=gatsby-ssr.js
const React = require("react")
const Layout = require("./src/components/layout")

// Adds a class name to the body element
exports.onRenderBody = ({ setBodyAttributes }, pluginOptions) => {
  setBodyAttributes({
    className: "my-body-class",
  })
}

// Wraps every page in a component
exports.wrapPageElement = ({ element, props }) => {
  return <Layout {...props}>{element}</Layout>
}
```
