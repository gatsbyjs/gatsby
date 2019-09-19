---
title: The gatsby-ssr.js API file
---

The file `gatsby-ssr.js` lets you alter the content of static HTML files as they are being rendered by Gatsby. To use the [Gatby SSR APIs](/docs/ssr-apis/), first create a file called `gatsby-ssr.js` in the root of your site. Expose any of the APIs you wish to use in this file.

The APIs `wrapPageElement` and `wrapRootElement` exist in both the SSR and [browser APIs](/docs/browser-apis). If you are using them, consider if you should implement them in both `gatsby-ssr.js` and `gatsby-browser.js`.

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
